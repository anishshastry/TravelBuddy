import { useState } from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!email || !phone) {
      return "Email or Phone number is required";
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return "Invalid email format";
    }

    if (phone && !/^[0-9]{10}$/.test(phone)) {
      return "Phone number must be 10 digits";
    }

    if (!password) {
      return "Password is required";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }

    if (!role) {
      return "Please select a role";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const validationError = validateForm();
  if (validationError) {
    setError(validationError);
    return;
  }

  setError("");

  try {
    const response = await fetch("http://localhost:8000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        phone,
        password,
        role,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Registration failed");
      return;
    }

    // Store identifier for OTP step
    localStorage.setItem("identifier", email || phone || "");

    navigate("/verifyOTP");
  } catch (err) {
    setError("Server error");
  }
};

  return (
    <div className="page">
      <div className="card">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Phone</label>
          <input
            type="text"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="" disabled>Select your role</option>
            <option value="traveler">Traveler</option>
            <option value="buddy">Buddy</option>
          </select>

          {error && <div className="error">{error}</div>}

          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}
