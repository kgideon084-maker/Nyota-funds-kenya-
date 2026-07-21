const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// PAYHERO CREDENTIALS
const BASIC_AUTH = "Basic ZFJ1TVhWQzQ4dWpXa2Y1TGZCWFo6RmhjaDIxRWc4WExrUVhhM29wRGhiSVBzUzZRbkkyRVRLSUxqZk5xdw==";
const CHANNEL_ID = "5920";

// STK PUSH ROUTE
app.post("/pay", async (req, res) => {
  try {
    let { phone, amount } = req.body;
    phone = phone.replace("+", "").replace(/^0/, "254");
    
    const response = await axios.post(
      "https://api.payhero.co.ke/api/v2/payments/mpesa/stkpush", 
      {
        amount: parseInt(amount),
        phone: phone,
        channel_id: CHANNEL_ID,
        callback_url: "https://nyota-funds-kenya-r7pj.onrender.com/pay/callback" // BADILISHA HII IWE YA NYOTA
      }, 
      {
        headers: {
          "Authorization": BASIC_AUTH,
          "Content-Type": "application/json"
        }
      }
    );
    res.json(response.data);
  } catch (err) {
    console.log("Payhero Error:", err.response ? err.response.data : err.message);
    res.status(500).json({ error: err.response ? err.response.data : "Server error" });
  }
});

// CALLBACK
app.post("/pay/callback", (req, res) => {
  console.log("Payment callback:", req.body);
  res.status(200).send("OK");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
