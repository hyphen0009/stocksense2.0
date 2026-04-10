const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_WHATSAPP_NUMBER;

/**
 * Triggers when a product's quantity changes.
 * Sends a WhatsApp alert if stock falls below 10.
 */
exports.onProductUpdate = functions.firestore
    .document('products/{productId}')
    .onUpdate(async (change, context) => {
        const newValue = change.after.data();
        const previousValue = change.before.data();

        // Only alert if stock drops below 10 and was previously higher
        if (newValue.quantity < 10 && previousValue.quantity >= 10) {
            const shopId = newValue.shopId;

            // Get user's phone number
            const userDoc = await admin.firestore().collection('users').doc(shopId).get();
            if (!userDoc.exists) return null;

            const phoneNumber = userDoc.data().phoneNumber;
            const message = `⚠️ Low Stock Alert: "${newValue.name}" has only ${newValue.quantity} units left! Please restock soon.`;

            // Use Twilio to send message
            // Note: In Cloud Functions, we use a simple fetch/axios or Twilio SDK
            return sendWhatsApp(phoneNumber, message);
        }
        return null;
    });

async function sendWhatsApp(to, body) {
    const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64');
    try {
        await axios.post(
            `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
            new URLSearchParams({
                From: `whatsapp:${TWILIO_FROM}`,
                To: `whatsapp:${to}`,
                Body: body
            }).toString(),
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
    } catch (error) {
        console.error('Failed to send auto-alert:', error.response ? error.response.data : error.message);
    }
}
