const express = require("express");
const bodyParser = require("body-parser");
const Razorpay = require("razorpay");
const nodemailer = require("nodemailer");

const app = express();
const port = 3000; // Replace with your desired port

const dotenv = require("dotenv");
dotenv.config();

const razorpay = new Razorpay({
  key_id: "YOUR_RAZORPAY_KEY_ID", // Replace with your actual Key ID
  key_secret: "YOUR_RAZORPAY_KEY_SECRET", // Replace with your actual Key Secret
});

// Configure Nodemailer with your email service details
const transporter = nodemailer.createTransport({
  service: "Gmail", // Replace with your email service (e.g., Gmail, Outlook, etc.)
  auth: {
    user: "YOUR_EMAIL_ADDRESS",
    pass: "YOUR_EMAIL_PASSWORD",
  },
});

app.use(bodyParser.json());

app.post("/create-payment", async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body;

    // Create a Razorpay order
    const order = await razorpay.orders.create({
      amount: amount,
      currency: currency || "INR",
      receipt: receipt || "order_receipt",
      notes: notes || {},
    });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to create Razorpay order." });
  }
});

app.post("/verify-payment", async (req, res) => {
  try {
    const { orderId, paymentId, signature, email } = req.body;

    // Verify the payment signature
    const attributes = `${orderId}|${paymentId}`;
    const isSignatureValid = razorpay.validateWebhookSignature(
      attributes,
      signature
    );

    if (!isSignatureValid) {
      return res.status(403).json({ error: "Invalid signature" });
    }

    // Fetch the payment details
    const payment = await razorpay.payments.fetch(paymentId);

    // Process the payment and send confirmation email to the user
    const mailOptions = {
      from: "YOUR_EMAIL_ADDRESS", // Replace with your email address
      to: email, // Use the user's email address
      subject: "Payment Confirmation",
      text: "Thank you for your purchase. Your payment was successful!",
    };

    await transporter.sendMail(mailOptions);

    // For demonstration purposes, we will just send a success response
    res.status(200).json({ message: "Payment successful" });
  } catch (error) {
    res.status(500).json({ error: "Payment verification failed" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
