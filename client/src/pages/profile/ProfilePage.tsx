import Footer from "../../components/UI/Footer";
import Navbar from "../../components/UI/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

type ProfileData = {
  _id: string;
  avatar: string;
  avatarUrl?: string;
  username: string;
  name: string;
  bio: string;
  location: string;
  pronouns: string;
  link: string;
  isPrivate: boolean;
  isOwnProfile: boolean;
  isFollowing: boolean;
  isRequested: boolean;
  canViewFullProfile: boolean;
  followerCount: number;
  followingCount: number;
};

export default function Profile() {
  const navigate = useNavigate();
  const { username } = useParams();
  const token = localStorage.getItem("token");

  const [userNotFound, setUserNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    _id: "",
    avatar: "",
    avatarUrl: "",
    username: "",
    name: "",
    bio: "",
    location: "",
    pronouns: "",
    link: "",
    isPrivate: false,
    isOwnProfile: false,
    isFollowing: false,
    isRequested: false,
    canViewFullProfile: true,
    followerCount: 0,
    followingCount: 0,
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setUserNotFound(false);

      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`/api/user/${username}`, { headers });

      if (!res.ok) {
        setUserNotFound(true);
        setLoading(false);
        return;
      }

      const data = await res.json();

      setProfile({
        ...data,
        avatarUrl: data.avatar
          ? `http://localhost:5555${data.avatar}`
          : "/assets/default-avatar.jpg",
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setUserNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setCurrentUser(null);
        return;
      }

      try {
        const res = await fetch("/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;
        const data = await res.json();
        setCurrentUser(data.username);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };

    fetchProfile();
    fetchCurrentUser();
  }, [username]);

  const handleFollowAction = async () => {
    if (!token || !profile.username) {
      navigate("/login");
      return;
    }

    try {
      setActionLoading(true);

      const method =
        profile.isFollowing || profile.isRequested ? "DELETE" : "POST";

      const res = await fetch(`/api/user/${profile.username}/follow`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Something went wrong");
        return;
      }

      setProfile((prev) => ({
        ...prev,
        isFollowing: data.isFollowing,
        isRequested: data.requested,
        followerCount: data.followerCount,
        canViewFullProfile: data.isFollowing ? true : prev.canViewFullProfile,
      }));

      if (!profile.isFollowing && !profile.isRequested) {
        if (!profile.isPrivate) {
          setProfile((prev) => ({
            ...prev,
            isFollowing: true,
            followerCount: data.followerCount,
            canViewFullProfile: true,
          }));
        } else {
          setProfile((prev) => ({
            ...prev,
            isRequested: true,
          }));
        }
      }

      if (profile.isFollowing || profile.isRequested) {
        await fetchProfile();
      }
    } catch (err) {
      console.error("Follow action failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (userNotFound) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="flex flex-1 items-center justify-center">
          <h1 className="text-3xl font-bold text-gray-600">
            Page not found...
          </h1>
        </div>

        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center text-gray-500">
          Loading profile...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex gap-12">
          <div className="w-1/5 flex-shrink-0">
            <img
              src={profile.avatarUrl || "/assets/default-avatar.jpg"}
              className="rounded-full w-48 h-48 object-cover"
            />

            <div className="mt-6 space-y-4 text-sm">
              <div>
                <p className="text-xl font-bold">
                  {profile.name || profile.username}
                </p>
                <p className="text-lg text-gray-500">@{profile.username}</p>
              </div>

              {currentUser === profile.username ? (
                <button
                  className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-blue-500 hover:text-white transition w-full"
                  onClick={() => navigate("/settings/profile")}
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  className={`px-4 py-2 rounded-md transition w-full text-white ${
                    profile.isFollowing
                      ? "bg-gray-700 hover:bg-gray-800"
                      : profile.isRequested
                        ? "bg-orange-500 hover:bg-orange-600"
                        : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  onClick={handleFollowAction}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Please wait..."
                    : profile.isFollowing
                      ? "Unfollow"
                      : profile.isRequested
                        ? "Cancel request"
                        : profile.isPrivate
                          ? "Request to follow"
                          : "Follow"}
                </button>
              )}

              <div className="flex gap-4">
                <div>
                  <p className="font-bold text-lg">{profile.followerCount}</p>
                  <p className="text-gray-500">Followers</p>
                </div>
                <div>
                  <p className="font-bold text-lg">{profile.followingCount}</p>
                  <p className="text-gray-500">Following</p>
                </div>
              </div>

              {profile.isPrivate && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                  <p className="font-semibold">Private account</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Only approved followers can view the full profile.
                  </p>
                </div>
              )}

              {profile.canViewFullProfile && (
                <>
                  <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-gray-600">
                      {profile.location || "Not added"}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold">Pronouns</p>
                    <p className="text-gray-600">
                      {profile.pronouns || "Not added"}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold">Link</p>
                    {profile.link ? (
                      <a
                        href={profile.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {profile.link}
                      </a>
                    ) : (
                      <p className="text-gray-600">No link added</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-extrabold">
                {profile.name || profile.username}
              </h1>
              {profile.isPrivate && (
                <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700">
                  Private
                </span>
              )}
            </div>

            {profile.canViewFullProfile ? (
              <>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  {profile.bio || "No bio available."}
                </p>

                <div className="border-b my-8"></div>

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
              </>
            ) : (
              <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-8">
                <h2 className="text-2xl font-bold">This profile is private</h2>
                <p className="mt-3 text-gray-600">
                  Follow this user to view their bio, workout plans, and profile
                  details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
