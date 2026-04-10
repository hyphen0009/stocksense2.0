import { NextRequest, NextResponse } from 'next/server';
import { whatsappAssistantFlow } from '@/ai/flows/whatsapp-assistant';
import { initializeFirebase } from '@/firebase';
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    addDoc,
    query,
    where,
    writeBatch
} from 'firebase/firestore';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message, from } = body; // Simplified for demo/setup

        if (!message) {
            return NextResponse.json({ error: 'No message provided' }, { status: 400 });
        }

        const { firestore } = initializeFirebase();

        // 1. Fetch Current Inventory
        const snapshot = await getDocs(collection(firestore, 'products'));
        const inventory = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as any));

        // 2. Run AI Assistant
        const aiResponse = await whatsappAssistantFlow({
            message,
            currentInventory: inventory
        });

        // 3. Act on Intent
        if (aiResponse.intent === 'SALE' && aiResponse.productId) {
            const product = inventory.find(p => p.id === aiResponse.productId);
            if (product && product.quantity >= (aiResponse.quantity || 1)) {
                const batch = writeBatch(firestore);
                const productRef = doc(firestore, 'products', product.id);
                const saleRef = doc(collection(firestore, 'sales'));

                batch.update(productRef, {
                    quantity: product.quantity - (aiResponse.quantity || 1)
                });
                batch.set(saleRef, {
                    productId: product.id,
                    productName: product.name,
                    quantity: aiResponse.quantity || 1,
                    total: product.price * (aiResponse.quantity || 1),
                    timestamp: new Date().toISOString(),
                    source: 'whatsapp'
                });

                await batch.commit();
            }
        } else if (aiResponse.intent === 'RESTOCK' && aiResponse.productId) {
            const product = inventory.find(p => p.id === aiResponse.productId);
            if (product) {
                const productRef = doc(firestore, 'products', product.id);
                await updateDoc(productRef, {
                    quantity: product.quantity + (aiResponse.quantity || 0)
                });
            }
        }

        // 4. Return response (to be sent back to WhatsApp)
        return NextResponse.json({
            success: true,
            response: aiResponse.responseMessage
        });

    } catch (error: any) {
        console.error('WhatsApp Hook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
