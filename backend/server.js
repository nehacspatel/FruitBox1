const express = require('express');
const cors = require('cors');
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { Pool } = require('pg'); 
require('dotenv').config(); 

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


app.post("/order", async (req, res) => {
  try {
    const { amount } = req.body;
    console.log(process.env.RAZORPAY_KEY_ID);
    console.log(process.env.RAZORPAY_KEY_SECRET);

    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    console.log(options)

    const order = await razorpay.orders.create(options);
    console.log(order);

    if (!order || !order.id) {
      return res.status(500).send("Error creating order");
    }

    res.json({ order });
  } catch (err) {
    console.error("Razorpay Error:", err);

    res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
    });
  }
});


app.post("/verify-payment", (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    
    res.json({ success: true, message: "Payment verified successfully" });
  } else {
    res.status(400).json({ success: false, message: "Payment verification failed" });
  }
});

app.listen(8081, () => {
  console.log("Server is running on http://localhost:8081");
});
