import Footer from "../../components/UI/Footer";
import Navbar from "../../components/UI/Navbar";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const { username } = useParams();
  const [userNotFound, setUserNotFound] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const [form, setForm] = useState({
    avatar: null as File | null,
    avatarUrl: "",
    username: "",
    name: "",
    bio: "",
    location: "",
    pronouns: "",
    link: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/user/${username}`);

        if (!res.ok) {
          setUserNotFound(true);
          return;
        }

        const data = await res.json();

        setForm({
          avatar: null,
          avatarUrl: data.avatar ? `http://localhost:5555${data.avatar}` : "",
          name: data.name || "",
          username: data.username || "",
          bio: data.bio || "",
          location: data.location || "",
          pronouns: data.pronouns || "",
          link: data.link || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setCurrentUser(data.username);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };

    fetchProfile();
    fetchCurrentUser();
  }, [username]);

  if (userNotFound) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="flex flex-1 items-center justify-center">
          <h1 className="text-3xl font-bold text-gray-600">User not found</h1>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* Top Profile Section */}
        <div className="flex gap-12">
          {/* LEFT SIDE – Avatar + Small Info */}
          <div className="w-1/5 flex-shrink-0">
            <img
              src={
                form.avatar
                  ? URL.createObjectURL(form.avatar)
                  : form.avatarUrl
                    ? form.avatarUrl
                    : "/assets/default-avatar.jpg"
              }
              className="rounded-full w-48 h-48 object-cover"
            />

            {/* Small Meta Info */}
            <div className="mt-6 space-y-4 text-sm">
              <div>
                <p className="text-xl font-bold">{form.name}</p>
                <p className="text-lg text-gray-500">@{form.username}</p>
              </div>
              {currentUser === form.username && (
                <button
                  className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-blue-500 hover:text-white transition w-full"
                  onClick={() => navigate("/settings/profile")}
                >
                  Edit Profile
                </button>
              )}
              {/* Followers / Following */}
              <div className="flex gap-4">
                <div>
                  <p className="font-bold text-lg">245</p>
                  <p className="text-gray-500">Followers</p>
                </div>
                <div>
                  <p className="font-bold text-lg">180</p>
                  <p className="text-gray-500">Following</p>
                </div>
              </div>

              {/* Location */}
              <div>
                <p className="font-semibold">Location</p>
                <p className="text-gray-600">{form.location}</p>
              </div>

              {/* Pronouns */}
              <div>
                <p className="font-semibold">Pronouns</p>
                <p className="text-gray-600">{form.pronouns}</p>
              </div>

              {/* Social Accounts */}
              <div>
                <p className="font-semibold">Social</p>
                <div className="space-y-1 text-blue-600">
                  <a href="#" className="block hover:underline">
                    Instagram
                  </a>
                  <a href="#" className="block hover:underline">
                    YouTube
                  </a>
                  <a href="#" className="block hover:underline">
                    TikTok
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE – Username + Bio */}
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold">{form.name}</h1>

            <p className="mt-4 text-gray-700 leading-relaxed">
              {form.bio || "No bio available."}
            </p>

            {/* Divider */}
            <div className="border-b my-8"></div>

            {/* Pinned / Showcased Plans */}
            <section>
              <h2 className="text-2xl font-bold mb-4">
                📌 Pinned Workout Plans
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-5 border rounded-xl hover:shadow-md transition">
                  <h3 className="font-semibold text-lg">Push Pull Legs</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    5 days • Hypertrophy focused
                  </p>
                </div>

                <div className="p-5 border rounded-xl hover:shadow-md transition">
                  <h3 className="font-semibold text-lg">ACL Rehab Plan</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    3 days • Mobility + Strength
                  </p>
                </div>
              </div>
            </section>

            {/* All Workout Plans */}
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-4">All Workout Plans</h2>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg hover:bg-gray-50 transition">
                  Upper Body Strength Program
                </div>

                <div className="p-4 border rounded-lg hover:bg-gray-50 transition">
                  Lean Bulk 12 Week Plan
                </div>

                <div className="p-4 border rounded-lg hover:bg-gray-50 transition">
                  Beginner Full Body Split
                </div>
              </div>
            </section>

            {/* Recent Comments / Activity */}
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>

              <div className="space-y-6">
                <div className="border-l-4 border-gray-300 pl-4">
                  <p className="text-sm text-gray-500">
                    Commented on Leg Day Plan
                  </p>
                  <p className="mt-1">
                    "This structure is perfect for progressive overload."
                  </p>
                </div>

                <div className="border-l-4 border-gray-300 pl-4">
                  <p className="text-sm text-gray-500">
                    Created a new workout plan
                  </p>
                  <p className="mt-1 font-medium">
                    Summer Shred 8 Week Program
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
