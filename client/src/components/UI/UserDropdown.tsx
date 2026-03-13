import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

type User = { username: string; email: string; avatar?: string };

export default function UserDropdown({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right - 192,
      });
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (
        !target ||
        (buttonRef.current && buttonRef.current.contains(target)) ||
        (dropdownRef.current && dropdownRef.current.contains(target))
      ) {
        return;
      }
      setOpen(false);
    };

    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <>
      <div
        ref={buttonRef}
        onClick={() => setOpen((s) => !s)}
        className="flex items-center cursor-pointer"
      >
        <img
          src={user.avatar || "/assets/default-avatar.jpg"}
          className="w-12 h-12 rounded-full mr-4 object-cover"
        />
        <div>{user.username}</div>
        <svg
          className={`w-5 h-5 ml-1 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: position.top,
              left: position.left,
            }}
            className="bg-white text-black rounded shadow-lg py-2 w-48 z-[9999]"
          >
            <a
              href={`/${user.username}`}
              className="block px-4 py-2 hover:bg-gray-200"
            >
              Profile
            </a>
            <a href="/settings" className="block px-4 py-2 hover:bg-gray-200">
              Settings
            </a>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 hover:bg-gray-200 text-red-600"
            >
              Logout
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
