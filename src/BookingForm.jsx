import React, { useState } from "react";

function BookingForm() {
  const [result, setResult] = useState(null);
  const [tokenResult, setTokenResult] = useState(null);

  const book = async () => {
    try {
      const res = await fetch("http://localhost:5000/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: "1234567890",
          name: "Test User",
          ward: "general",
          emergency: false
        })
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, message: error.message });
    }
  };

  // Book Token function
  const bookToken = async () => {
    try {
      const res = await fetch("http://localhost:5000/book-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: "1234567890",
          name: "Test User"
        })
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setTokenResult(data);
    } catch (error) {
      setTokenResult({ success: false, message: error.message });
    }
  };

  return (
    <div>
      <button onClick={book}>Book Now</button>
      {result && (
        <div>
          {result.success
            ? "Booking successful!"
            : `Error: ${result.message}`}
        </div>
      )}
      <button onClick={bookToken}>Book Token</button>
      {tokenResult && (
        <div>
          {tokenResult.success
            ? "Token booking successful!"
            : `Error: ${tokenResult.message}`}
        </div>
      )}
    </div>
  );
}

export default BookingForm;