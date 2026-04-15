import { useEffect, useState } from "react";
import UserDropdown from "./UserDropdown";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const token = localStorage.getItem("token");

  type User = {
    username: string;
    email: string;
    avatar?: string;
  };

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        setUser({
          ...data,
          avatar: data.avatar
            ? `http://localhost:5555${data.avatar}`
            : "/assets/default-avatar.jpg",
        });
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  return (
    <nav className="grid h-32 grid-cols-3 bg-gray-800 p-4 text-white">
      <div className="ml-10 flex items-center justify-start text-xl">
        <a href="/" className="hover:cursor-pointer">
          Athletica
        </a>
      </div>

      <div className="flex items-center justify-center space-x-10 text-xl">
        <a href="/dashboard" className="hover:cursor-pointer">
          Home
        </a>
        <a href="/discover" className="hover:cursor-pointer">
          Discover
        </a>
        <a href="/routines" className="hover:cursor-pointer">
          Routines
        </a>
        <a href="/about" className="hover:cursor-pointer">
          About
        </a>
      </div>

      <div className="mr-10 flex items-center justify-end text-xl">
        {!token && (
          <a href="/login" className="hover:cursor-pointer">
            Login
          </a>
        )}

        {token && loading && <span>Loading...</span>}

        {token && user && (
          <>
            <NotificationBell />
            <UserDropdown user={user} />
          </>
        )}
      </div>
    </nav>
  );
}
