import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Twilio sandbox number

const client = twilio(accountSid, authToken);

export async function sendWhatsAppMessage(to: string, body: string) {
    try {
        const message = await client.messages.create({
            body,
            from: whatsappNumber.startsWith('whatsapp:') ? whatsappNumber : `whatsapp:${whatsappNumber}`,
            to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
        });
        console.log('WhatsApp message sent:', message.sid);
        return message;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
}
