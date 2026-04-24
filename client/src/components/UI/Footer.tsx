import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-5 text-center text-sm md:flex-row">
        <p>&copy; {new Date().getFullYear()} Athletica. All rights reserved.</p>

        <div className="flex gap-5">
          <Link to="/terms" className="text-gray-300 hover:text-white">
            Terms
          </Link>

          <Link to="/legal" className="text-gray-300 hover:text-white">
            Legal
          </Link>
        </div>
      </div>
    </footer>
  );
}
