import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5555/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // Store token and navigate to dashboard
    localStorage.setItem("token", data.token);
    navigate("/dashboard");
  };

  return (
    <div>
      <h1 className="font-bold">Login Page</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            required
            className="border"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            required
            className="border"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 hover:cursor-pointer"
        >
          Login
        </button>
      </form>
    </div>
  );
}
