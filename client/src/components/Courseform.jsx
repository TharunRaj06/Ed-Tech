import React, { useState } from "react";

const CourseForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [college, setCollege] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("Java");
  const [price, setPrice] = useState(800);
  const [paymentStatus, setPaymentStatus] = useState("");

  const handleCourseChange = (event) => {
    const course = event.target.value;
    setSelectedCourse(course);

    // Update price based on course selection
    if (course === "Java") {
      setPrice(800);
    } else if (course === "Web") {
      setPrice(700);
    }
  };

  const handleBuyClick = () => {
    // Call your backend API to initiate the payment
    fetch("/create-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: price,
        currency: "INR", // Replace with your desired currency
        receipt: "order_receipt", // Replace with a unique order receipt ID
        notes: {}, // Add any additional notes if needed
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // On successful response, initiate payment using data received from the backend
        const options = {
          key: data.key_id,
          amount: data.amount,
          currency: data.currency,
          name: "Course Purchase",
          description: `Purchase of ${selectedCourse} course`,
          image: "YOUR_LOGO_URL", // Replace with your logo URL
          order_id: data.id,
          handler: handlePaymentSuccess,
          prefill: {
            name: name,
            email: email,
            contact: phoneNumber,
          },
          notes: {},
          theme: {
            color: "#F37254",
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handlePaymentSuccess = (response) => {
    // Call your backend API to verify the payment and send confirmation email to the user
    fetch("/verify-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature,
        email: email,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setPaymentStatus(data.message); // Set the payment status message
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div>
      <form>
        {/* Add input fields for name, email, phone number, college */}
        {/* Add radio buttons for course selection */}
        <label>
          Java
          <input
            type="radio"
            value="Java"
            checked={selectedCourse === "Java"}
            onChange={handleCourseChange}
          />
        </label>
        <label>
          Web
          <input
            type="radio"
            value="Web"
            checked={selectedCourse === "Web"}
            onChange={handleCourseChange}
          />
        </label>
        <p>Price: ${price}</p>
        <button onClick={handleBuyClick}>Buy</button>
      </form>
      {paymentStatus && <p>{paymentStatus}</p>}
    </div>
  );
};

export default CourseForm;
