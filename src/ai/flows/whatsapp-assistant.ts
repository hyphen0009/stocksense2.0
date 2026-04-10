'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WhatsAppCommandInputSchema = z.object({
    message: z.string().describe('The message received from WhatsApp.'),
    currentInventory: z.array(z.object({
        id: z.string(),
        name: z.string(),
        barcode: z.string(),
        quantity: z.number(),
        price: z.number()
    })).describe('The current list of products in the store.')
});

const WhatsAppCommandOutputSchema = z.object({
    intent: z.enum(['SALE', 'RESTOCK', 'QUERY', 'REPORT', 'UNKNOWN']).describe('The detected action.'),
    productId: z.string().optional().describe('ID of the product being referenced.'),
    quantity: z.number().optional().describe('Quantity to add or subtract.'),
    responseMessage: z.string().describe('The confirmation message to send back to the user on WhatsApp.')
});

export const whatsappAssistantPrompt = ai.definePrompt({
    name: 'whatsappAssistantPrompt',
    input: { schema: WhatsAppCommandInputSchema },
    output: { schema: WhatsAppCommandOutputSchema },
    prompt: `You are a smart shop assistant for a Kirana store called "Stock Sense". 
Your job is to listen to the owner's WhatsApp message and decide what action to take.

Current Inventory:
{{{JSON.stringify currentInventory}}}

Instructions:
1. Detect the intent:
   - SALE: If they sold something (e.g., "Sold 2 milk", "Out 1 bread").
   - RESTOCK: If they added stock (e.g., "Added 10kg sugar", "Received 5 oil").
   - QUERY: If they asked about stock (e.g., "How many eggs left?", "Check milk").
   - REPORT: If they asked about performance (e.g., "Today's sale?").
2. Find the Product: Match the name in the message to the "currentInventory". Be flexible with spellings.
3. Extract Quantity: Find the number they mentioned.
4. Response Message: Create a friendly, short confirmation in "Kirana store style" (mix of English and simple terms).

Example:
Input: "Sold 2 Premium Basmati Rice"
Output: { "intent": "SALE", "productId": "id1", "quantity": 2, "responseMessage": "✅ Noted! Sold 2 units of Basmati Rice. Stock updated." }

User Message: "{{message}}"
`,
});

export const whatsappAssistantFlow = ai.defineFlow(
    {
        name: 'whatsappAssistantFlow',
        inputSchema: WhatsAppCommandInputSchema,
        outputSchema: WhatsAppCommandOutputSchema,
    },
    async (input) => {
        const { output } = await whatsappAssistantPrompt(input);
        return output!;
    }
);
