import { ai } from '../genkit';
import { z } from 'genkit';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    Timestamp,
    orderBy,
    limit
} from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../../firebase/config';
import { predictiveStockAlerts } from './predictive-stock-alerts';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Flow Implementation ---

export const whatsappAssistantFlow = ai.defineFlow(
    {
        name: 'whatsappAssistantFlow',
        inputSchema: z.object({
            text: z.string(),
            from: z.string(), // WhatsApp phone number
        }),
        outputSchema: z.string(),
    },
    async (input) => {
        // 1. Identify User
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('phoneNumber', '==', input.from));
        const userSnapshot = await getDocs(q);

        if (userSnapshot.empty) {
            return "Hello! I don't recognize this number. Please register your shop at StockSense.com first. नमस्ते! मैं इस नंबर को नहीं पहचानता। कृपया पहले StockSense.com पर अपनी दुकान रजिस्टर करें।";
        }

        const userData = userSnapshot.docs[0].data();
        const shopId = userData.shopId || userSnapshot.docs[0].id;

        // 2. Process Intent
        const result = await ai.generate({
            prompt: `
        You are the Stock Sense WhatsApp Assistant.
        User Shop: ${userData.storeName || 'Your Store'}
        Incoming Message: "${input.text}"
        Shop ID: ${shopId}
        
        Your Goal:
        1. Identify the user intent (ADD, SOLD, STOCK, PREDICTION).
        2. Call tools to perform actions.
        3. Respond in the same language as the user (English or Hindi).
        4. Keep responses short and store-friendly.
      `,
            tools: [
                // We define tools that take shopId as a parameter (marked as controlled)
                addProductTool,
                recordSaleTool,
                checkStockTool,
                getPredictionTool
            ],
        });

        return result.text;
    }
);

// --- Tools ---

const addProductTool = ai.defineTool(
    {
        name: 'addProductTool',
        description: 'Add or restock a product. Input quantity and name. Category and price are optional.',
        inputSchema: z.object({
            shopId: z.string(),
            name: z.string(),
            quantity: z.number(),
            category: z.string().optional(),
            price: z.number().optional()
        }),
    },
    async (input) => {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('shopId', '==', input.shopId), where('name', '==', input.name));
        const snap = await getDocs(q);

        if (!snap.empty) {
            const productDoc = snap.docs[0];
            const currentQty = productDoc.data().quantity || 0;
            await updateDoc(doc(db, 'products', productDoc.id), {
                quantity: currentQty + input.quantity,
                updatedAt: Timestamp.now()
            });
            return `Restocked ${input.name}. New total: ${currentQty + input.quantity}.`;
        } else {
            await addDoc(productsRef, {
                name: input.name,
                quantity: input.quantity,
                category: input.category || 'Others',
                price: input.price || 0,
                shopId: input.shopId,
                barcode: '', // Could generate one
                updatedAt: Timestamp.now()
            });
            return `Added new product: ${input.name} with ${input.quantity} units.`;
        }
    }
);

const recordSaleTool = ai.defineTool(
    {
        name: 'recordSaleTool',
        description: 'Record a sale. Decrements stock and logs transaction.',
        inputSchema: z.object({
            shopId: z.string(),
            name: z.string(),
            quantity: z.number()
        }),
    },
    async (input) => {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('shopId', '==', input.shopId), where('name', '==', input.name));
        const snap = await getDocs(q);

        if (snap.empty) return `Sorry, I couldn't find "${input.name}" in your inventory.`;

        const productDoc = snap.docs[0];
        const p = productDoc.data();

        if (p.quantity < input.quantity) return `Insufficient stock for ${input.name}. Current: ${p.quantity}.`;

        // Update Product
        await updateDoc(doc(db, 'products', productDoc.id), {
            quantity: p.quantity - input.quantity,
            updatedAt: Timestamp.now()
        });

        // Record Sale
        await addDoc(collection(db, 'sales'), {
            productId: productDoc.id,
            productName: p.name,
            quantity: input.quantity,
            total: (p.price || 0) * input.quantity,
            shopId: input.shopId,
            timestamp: Timestamp.now()
        });

        return `Sold ${input.quantity} ${input.name}. Remaining: ${p.quantity - input.quantity}.`;
    }
);

const checkStockTool = ai.defineTool(
    {
        name: 'checkStockTool',
        description: 'Get current stock levels for all or specific products.',
        inputSchema: z.object({
            shopId: z.string(),
            query: z.string().optional()
        }),
    },
    async (input) => {
        const productsRef = collection(db, 'products');
        let q = query(productsRef, where('shopId', '==', input.shopId));
        const snap = await getDocs(q);

        if (snap.empty) return "Your inventory is currently empty.";

        const list = snap.docs.map((d: any) => `${d.data().name}: ${d.data().quantity}`).join('\n');
        return `Current Inventory:\n${list}`;
    }
);

const getPredictionTool = ai.defineTool(
    {
        name: 'getPredictionTool',
        description: 'Predict when items will run out of stock.',
        inputSchema: z.object({
            shopId: z.string()
        }),
    },
    async (input: any) => {
        // 1. Fetch Products
        const pSnap = await getDocs(query(collection(db, 'products'), where('shopId', '==', input.shopId)));
        // 2. Fetch Sales (last 30 days)
        const sSnap = await getDocs(query(collection(db, 'sales'), where('shopId', '==', input.shopId), orderBy('timestamp', 'desc'), limit(100)));

        const products = pSnap.docs.map((d: any) => ({
            productId: d.id,
            productName: d.data().name,
            currentStock: d.data().quantity || 0,
            salesHistory: sSnap.docs
                .filter((s: any) => s.data().productId === d.id)
                .map((s: any) => ({
                    date: s.data().timestamp.toDate().toISOString().split('T')[0],
                    quantitySold: s.data().quantity
                }))
        }));

        const result = await predictiveStockAlerts({ products, predictionHorizonDays: 30 });
        return result.summary;
    }
);
