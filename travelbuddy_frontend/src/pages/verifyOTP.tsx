import { useState } from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";

export default function VerifyOTP() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!otp) {
    setError("OTP is required");
    return;
  }

  const identifier = localStorage.getItem("identifier");

  try {
    const response = await fetch("http://localhost:8000/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier,
        otp,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Invalid OTP..!!");
      return;
    }

    navigate("/login");
  } catch {
    setError("Server error");
  }
};

  return (
    <div className="page">
      <div className="card">
        <h2>Verify OTP</h2>

        <form onSubmit={handleVerify}>
          <label>Enter OTP</label>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          {error && <div className="error">{error}</div>}

          <button type="submit">Verify</button>
        </form>
      </div>
    </div>
  );
}
