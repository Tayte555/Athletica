import Footer from "../../components/UI/Footer";
import Navbar from "../../components/UI/Navbar";

export default function Dashboard() {
  return (
    <div>
      <Navbar />
      <p className="text-7xl font-bold">Hello *username*</p>
      <h1>Dashboard</h1>

      <Footer />
    </div>
  );
}
