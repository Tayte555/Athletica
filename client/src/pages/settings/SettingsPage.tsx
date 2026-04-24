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
    isAdmin: false,
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
          isAdmin: Boolean(data.isAdmin),
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
      <div className="mx-auto flex max-w-6xl gap-12 py-10">
        <div className="w-64 border-r pr-6">
          <h2 className="mb-6 text-3xl font-bold">Settings</h2>

          <div className="mb-2 flex gap-3">
            <img
              src={
                form.avatar
                  ? URL.createObjectURL(form.avatar)
                  : form.avatarUrl
                    ? form.avatarUrl
                    : "/assets/default-avatar.jpg"
              }
              className="mb-4 h-14 w-14 rounded-full object-cover"
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
                `rounded-md px-3 py-2 transition ${
                  isActive ? "bg-gray-300 text-black" : "hover:bg-gray-100"
                }`
              }
            >
              Profile
            </NavLink>

            {/** Too be added in future versions - out of scope for now */}

            {/* <NavLink
              to="account"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 transition ${
                  isActive ? "bg-gray-300 text-black" : "hover:bg-gray-100"
                }`
              }
            >
              Account
            </NavLink>

            <NavLink
              to="security"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 transition ${
                  isActive ? "bg-gray-300 text-black" : "hover:bg-gray-100"
                }`
              }
            >
              Security
            </NavLink> */}

            <NavLink
              to="notifications"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 transition ${
                  isActive ? "bg-gray-300 text-black" : "hover:bg-gray-100"
                }`
              }
            >
              Notifications
            </NavLink>

            {form.isAdmin && (
              <NavLink
                to="admin"
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 transition ${
                    isActive ? "bg-gray-300 text-black" : "hover:bg-gray-100"
                  }`
                }
              >
                Admin
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex-1">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
}
