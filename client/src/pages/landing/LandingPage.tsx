import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div>
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
