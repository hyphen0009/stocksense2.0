import { NextRequest, NextResponse } from 'next/server';
import { whatsappAssistantFlow } from '@/ai/flows/whatsapp-assistant';
import { sendWhatsAppMessage } from '@/lib/twilio';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const body = formData.get('Body') as string;
        const from = formData.get('From') as string;

        if (!body || !from) {
            return NextResponse.json({ error: 'Missing Body or From' }, { status: 400 });
        }

        console.log(`Received WhatsApp from ${from}: ${body}`);

        // 1. Run the Genkit Assistant Flow
        const reply = await whatsappAssistantFlow({
            text: body,
            from: from,
        });

        // 2. Send the response back via Twilio
        await sendWhatsAppMessage(from, reply);

        // 3. Acknowledge Twilio
        return new NextResponse('OK', { status: 200 });
    } catch (error) {
        console.error('Error in WhatsApp Webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
