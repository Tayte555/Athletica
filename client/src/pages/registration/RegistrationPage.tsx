import { useState } from "react";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.currentTarget.name]: e.currentTarget.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5555/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        alert(data.message || "Registration failed");
      } else {
        alert("Registration successful!");
      }
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  return (
    <div>
      <h1 className="font-bold">Register</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="border"
          />
        </div>
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="border"
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="border"
          />
        </div>
        <div>
          <label>Confirm Password:</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="border"
          />
        </div>
        <button
          type="submit"
          className="hover:cursor-pointer border rounded m-2 p-2"
        >
          Register
        </button>
        <p>
          Already have an account?{" "}
          <a href="/login" className="text-blue-500">
            Login here
          </a>
        </p>
      </form>
    </div>
  );
}
