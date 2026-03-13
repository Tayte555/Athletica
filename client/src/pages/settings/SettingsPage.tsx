import Navbar from "../../components/UI/Navbar";
import { NavLink, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "../../components/UI/Footer";

export default function Settings() {
  const [form, setForm] = useState({
    avatar: null as File | null,
    avatarUrl: "",
    username: "",
    name: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        setForm({
          avatar: null,
          avatarUrl: data.avatar
            ? `${"http://localhost:5555"}${data.avatar}`
            : "",
          name: data.name || "",
          username: data.username || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto py-10 flex gap-12">
        {/* Sidebar Navigation */}
        <div className="w-64 border-r pr-6">
          <h2 className="text-3xl font-bold mb-6">Settings</h2>

          <div className="flex gap-3 mb-2">
            <img
              src={
                form.avatar
                  ? URL.createObjectURL(form.avatar)
                  : form.avatarUrl
                    ? form.avatarUrl
                    : "/assets/default-avatar.jpg"
              }
              className="rounded-full w-14 h-14 object-cover mb-4"
            />
            <div className="mt-1">
              <p className="text-md font-bold">{form.name}</p>
              <p className="text-sm text-gray-500">@{form.username}</p>
            </div>
          </div>

          <nav className="flex flex-col space-y-2">
            <NavLink
              to="profile"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition ${
                  isActive ? "bg-gray-300 text-black" : "hover:bg-gray-100"
                }`
              }
            >
              Profile
            </NavLink>

            <NavLink
              to="account"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition ${
                  isActive ? "bg-gray-300 text-black" : "hover:bg-gray-100"
                }`
              }
            >
              Account
            </NavLink>

            <NavLink
              to="security"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition ${
                  isActive ? "bg-gray-300 text-black" : "hover:bg-gray-100"
                }`
              }
            >
              Security
            </NavLink>

            <NavLink
              to="notifications"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition ${
                  isActive ? "bg-gray-300 text-black" : "hover:bg-gray-100"
                }`
              }
            >
              Notifications
            </NavLink>
          </nav>
        </div>

        {/* Selected Settings Component Renders Here */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
}
