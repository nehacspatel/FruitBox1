const express = require('express');
const cors = require('cors');
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { Pool } = require('pg'); // PostgreSQL library
require('dotenv').config(); // Load environment variables

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Order Creation Route
app.post("/order", async (req, res) => {
  try {
    const { amount } = req.body;
    console.log(process.env.RAZORPAY_KEY_ID);
    console.log(process.env.RAZORPAY_KEY_SECRET);

    const options = {
      amount: amount * 100, // Convert to paise
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

// Payment Verification Route
app.post("/verify-payment", (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    // Update payment in database here
    res.json({ success: true, message: "Payment verified successfully" });
  } else {
    res.status(400).json({ success: false, message: "Payment verification failed" });
  }
});

app.listen(8081, () => {
  console.log("Server is running on http://localhost:8081");
});
