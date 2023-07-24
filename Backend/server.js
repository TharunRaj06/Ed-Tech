const express = require("express");
const bodyParser = require("body-parser");
const Razorpay = require("razorpay");
const nodemailer = require("nodemailer");

const app = express();
const port = 3000;

const dotenv = require("dotenv");
dotenv.config();

const razorpay = new Razorpay({
  key_id: "YOUR_RAZORPAY_KEY_ID", // Replace with your actual Key ID
  key_secret: "YOUR_RAZORPAY_KEY_SECRET", // Replace with your actual Key Secret
});

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "YOUR_EMAIL_ADDRESS",
    pass: "YOUR_EMAIL_PASSWORD",
  },
});

app.use(bodyParser.json());

app.post("/create-payment", async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body;
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

    const attributes = `${orderId}|${paymentId}`;
    const isSignatureValid = razorpay.validateWebhookSignature(
      attributes,
      signature
    );

    if (!isSignatureValid) {
      return res.status(403).json({ error: "Invalid signature" });
    }

    const payment = await razorpay.payments.fetch(paymentId);

    const mailOptions = {
      from: "YOUR_EMAIL_ADDRESS",
      to: email,
      subject: "Payment Confirmation",
      text: "Thank you for your purchase. Your payment was successful!",
    };

    await transporter.sendMail(mailOptions);

    // Send the purchase details to the admin
    const mailOptionsAdmin = {
        from: 'YOUR_EMAIL_ADDRESS', // Replace with your email address
        to: 'ADMIN_EMAIL_ADDRESS', // Replace with the admin's email address
        subject: 'New Purchase',
        text: `A new purchase was made.\n\nName: ${name}\nEmail: ${email}\nPhone Number: ${phoneNumber}\nCollege: ${college}\nCourse: ${selectedCourse}\nPrice: ${price}`,
      };
  
      await transporter.sendMail(mailOptionsAdmin);
  
      // For demonstration purposes, we will just send a success response
      res.status(200).json({ message: 'Payment successful' });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
