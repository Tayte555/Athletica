import { useNavigate } from "react-router-dom";
import Navbar from "../../components/UI/Navbar";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div>
      <Navbar />
      <h1>Welcome to Athletica</h1>
      <button
        onClick={() => navigate("/register")}
        className="hover:cursor-pointer"
      >
        Get Started
      </button>
    </div>
  );
}
