import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Login() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState(""); // email or phone
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validateLogin = () => {
    if (!identifier) {
      return "Email or Phone is required";
    }

    if (!password) {
      return "Password is required";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const validationError = validateLogin();
  if (validationError) {
    setError(validationError);
    return;
  }

  try {
    const response = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Invalid Credentials..!!");
      return;
    }

    localStorage.setItem("token", data.token);
    navigate("/Dashboard");
  } catch {
    setError("Server error");
  }
};


  return (
    <div className="page">
      <div className="card">
        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
          <label>Email or Phone</label>
          <input
            type="text"
            placeholder="Enter email or phone"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <div className="error">{error}</div>}

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
