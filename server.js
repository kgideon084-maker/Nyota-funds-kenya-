const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Hifadhi ya boosts za muda mfupi
let boosts = [];

// SOMA CREDENTIALS KUTOKA KWA RENDER VARIABLES
const PAYHERO_USERNAME = process.env.PAYHERO_USERNAME;
const PAYHERO_PASSWORD = process.env.PAYHERO_PASSWORD;
const PAYHERO_CHANNEL_ID = process.env.PAYHERO_CHANNEL_ID;
const RENDER_URL = process.env.RENDER_URL;

// ROUTE 1: KUTUMA STK
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
            callback_url: `${RENDER_URL}/callback`
        }, {
            headers: { 
                'Authorization': `Basic ${auth}`, 
                'Content-Type': 'application/json' 
            }
        });
        
        console.log("STK Sent:", response.data);
        res.json({ status: 'Success', reference: response.data.reference, message: response.data.message });
        
    } catch (error) {
        console.log("Payhero Error:", error.response?.data || error.message);
        res.status(500).json({ status: 'Failed', message: error.response?.data?.message || 'STK Failed' });
    }
});

// ROUTE 2: PAYHERO CALLBACK - HAPA MALIPO YANAHIFADHIWA
app.post('/callback', (req, res) => {
    console.log("Payment Callback Received:", req.body);
    
    if(req.body.status === 'Success' || req.body.Status === 'Success'){
        // Weka kwa memory. Loan Amount = Fee * 20
        boosts.push({ 
            phone: req.body.phone_number, 
            amount: req.body.amount * 20, // Kama alilipa 350, onyesha amebost 7000
            time: Date.now() 
        });
    }
    res.status(200).json({ status: 'received' });
});

// ROUTE 3: KULETA BOOSTS KWA FRONTEND
app.get('/boosts', (req, res) => { 
    // Toa za saa 24 zilizopita tu
    const last24h = boosts.filter(b => Date.now() - b.time < 86400000);
    res.json(last24h.slice(-10).reverse()); 
});

app.listen(PORT, () => console.log(`nyota-backend running on port ${PORT}`));
