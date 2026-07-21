const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

let boosts = [];

const PAYHERO_USERNAME = "21Q6up1GXWq6lndkoxcF";
const PAYHERO_PASSWORD = "w3CnXXEP95c54vIq6JWiUFSP01NqVdCw";
const PAYHERO_CHANNEL_ID = "5920";

app.post('/pay', async (req, res) => {
    const { phone, amount } = req.body;
    if (!phone || !amount) {
        return res.status(400).json({ status: 'Failed', message: 'Phone and amount required' });
    }
    try {
        const auth = Buffer.from(`${PAYHERO_USERNAME}:${PAYHERO_PASSWORD}`).toString('base64');
        const response = await axios.post('https://www.payhero.co.ke/api/v2/payments', {
            amount: parseInt(amount),
            phone_number: phone,
            channel_id: PAYHERO_CHANNEL_ID,
            provider: "m-pesa",
            external_reference: `NYOTA-${Date.now()}`,
            callback_url: `${process.env.RENDER_URL}/callback`
        }, {
            headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' }
        });
        res.json({ status: 'Success', reference: response.data.reference, message: response.data.message });
    } catch (error) {
        console.log("Payhero Error:", error.response?.data || error.message);
        res.status(500).json({ status: 'Failed', message: error.response?.data?.message || 'STK Failed' });
    }
});

app.post('/callback', (req, res) => {
    console.log("Payment Callback:", req.body);
    if(req.body.status === 'Success' || req.body.Status === 'Success'){
        boosts.push({ phone: req.body.phone_number, amount: req.body.amount, time: Date.now() });
    }
    res.status(200).json({ status: 'received' });
});

app.get('/boosts', (req, res) => { res.json(boosts.slice(-10).reverse()); });

app.listen(PORT, () => console.log(`nyota-backend running on port ${PORT}`));
