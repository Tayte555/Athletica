import { Routes, Route } from "react-router-dom";
import Landing from "./pages/landing/LandingPage";
import Register from "./pages/registration/RegistrationPage";
import Login from "./pages/login/LoginPage";
import Dashboard from "./pages/dashboard/DashboardPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}
