import Footer from "../../components/UI/Footer";
import Navbar from "../../components/UI/Navbar";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [form, setForm] = useState({
    username: "",
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
          username: data.username || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Greeting */}
        <div className="mb-10">
          <h1 className="text-6xl font-bold mb-2">
            Hi {form.username || "Athlete"}!
          </h1>
          <p className="text-xl text-gray-600">What we doing today?</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Activity */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Activity Report</h2>

              <div className="h-40 flex items-center justify-center text-gray-400">
                Calendar Placeholder
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">My Stats</h2>

              <div className="space-y-2 text-gray-700">
                <p>Bodyweight</p>
                <p>Height</p>
                <p>BMI</p>
                <p>Calorie Maintenance</p>
                <p>Body Fat %</p>
                <p>Age</p>
                <p>Calorie Goal</p>
              </div>
            </div>
          </div>

          {/* Middle Column */}
          <div className="col-span-2 space-y-8">
            {/* Today's Workout */}
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Today’s Workout</h2>

                  <p className="font-medium mt-2">Upper Body Workout</p>

                  <p className="text-sm text-gray-500">By: James Ponds</p>
                </div>

                <button className="border p-2 rounded-lg">☆</button>
              </div>

              <div className="space-y-2 text-gray-700 mb-6">
                <div className="flex justify-between">
                  <span>Incline Dumbbell Press</span>
                  <span>3x6</span>
                </div>

                <div className="flex justify-between">
                  <span>Cable Chest Press</span>
                  <span>3x10</span>
                </div>

                <div className="flex justify-between">
                  <span>Cable Lat Pulldown</span>
                  <span>3x6</span>
                </div>

                <div className="flex justify-between">
                  <span>Dumbbell Lateral Raises</span>
                  <span>3x12</span>
                </div>

                <div className="flex justify-between">
                  <span>Cable Rows</span>
                  <span>3x10</span>
                </div>
              </div>

              <button className="bg-black text-white px-6 py-2 rounded-lg">
                Start Workout
              </button>
            </div>

            {/* Progression */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Progression</h2>

              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Incline Dumbbell Press</span>
                  <span>25kg → 28kg</span>
                </div>

                <div className="flex justify-between">
                  <span>Lat Pulldown</span>
                  <span>90kg → 95kg</span>
                </div>

                <div className="flex justify-between">
                  <span>Dumbbell Press</span>
                  <span>30kg → 32kg</span>
                </div>

                <div className="flex justify-between">
                  <span>Leg Press</span>
                  <span>190kg → 210kg</span>
                </div>

                <div className="flex justify-between">
                  <span>Squat</span>
                  <span>90kg → 100kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold mb-6 text-center">
            Quick Actions
          </h2>

          <div className="grid grid-cols-3 gap-8">
            <Link to="/routines/create">
              <div className="bg-white rounded-2xl shadow p-6 cursor-pointer hover:shadow-md transition">
                <div className="h-24 bg-gray-100 rounded mb-4"></div>
                <h3 className="font-semibold">Create Plan</h3>
                <p className="text-sm text-gray-500">
                  Start a brand new workout plan
                </p>
              </div>
            </Link>

            <Link to="/routines/saved">
              <div className="bg-white rounded-2xl shadow p-6 cursor-pointer hover:shadow-md transition">
                <div className="h-24 bg-gray-100 rounded mb-4"></div>
                <h3 className="font-semibold">View Saved Plans</h3>
                <p className="text-sm text-gray-500">
                  Continue your saved routines
                </p>
              </div>
            </Link>

            <Link to="/discover">
              <div className="bg-white rounded-2xl shadow p-6 cursor-pointer hover:shadow-md transition">
                <div className="h-24 bg-gray-100 rounded mb-4"></div>
                <h3 className="font-semibold">Discover Plans</h3>
                <p className="text-sm text-gray-500">
                  Explore community workouts
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
