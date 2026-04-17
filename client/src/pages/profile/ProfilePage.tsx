import Footer from "../../components/UI/Footer";
import Navbar from "../../components/UI/Navbar";
import { useNavigate, useParams, Link } from "react-router-dom";
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

type ProfileRoutine = {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  durationMinutes: number;
  image?: string;
  createdBy?: {
    _id?: string;
    username?: string;
    name?: string;
    avatar?: string;
  };
  exercisesCount?: number;
  likesCount?: number;
  savedByCount?: number;
  isSaved?: boolean;
  isPinned?: boolean;
  createdAt?: string;
};

type ProfileActivity = {
  _id: string;
  type: string;
  title: string;
  message: string;
  entityType: "profile" | "routine" | "comment" | "none";
  entityId?: string | null;
  createdAt: string;
};

const CREATED_PREVIEW_LIMIT = 3;
const ACTIVITY_PREVIEW_LIMIT = 4;

export default function Profile() {
  const navigate = useNavigate();
  const { username } = useParams();
  const token = localStorage.getItem("token");

  const [userNotFound, setUserNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [pinLoadingId, setPinLoadingId] = useState<string | null>(null);

  const [showPinnedManager, setShowPinnedManager] = useState(false);
  const [showAllCreated, setShowAllCreated] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);

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

  const [pinnedRoutines, setPinnedRoutines] = useState<ProfileRoutine[]>([]);
  const [createdRoutines, setCreatedRoutines] = useState<ProfileRoutine[]>([]);
  const [availableToPin, setAvailableToPin] = useState<ProfileRoutine[]>([]);
  const [recentActivity, setRecentActivity] = useState<ProfileActivity[]>([]);

  const previewCreatedRoutines = createdRoutines.slice(
    0,
    CREATED_PREVIEW_LIMIT,
  );
  const previewActivity = recentActivity.slice(0, ACTIVITY_PREVIEW_LIMIT);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

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

  const fetchProfileContent = async () => {
    try {
      setContentLoading(true);

      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`/api/user/${username}/profile-content`, {
        headers,
      });

      if (!res.ok) {
        return;
      }

      const data = await res.json();
      setPinnedRoutines(data.pinnedRoutines || []);
      setCreatedRoutines(data.createdRoutines || []);
      setAvailableToPin(data.availableToPin || []);
      setRecentActivity(data.recentActivity || []);
    } catch (err) {
      console.error("Failed to fetch profile content:", err);
    } finally {
      setContentLoading(false);
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
    fetchProfileContent();
  }, [username]);

  const refreshProfileContent = async () => {
    await fetchProfileContent();
  };

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

      await fetchProfileContent();
    } catch (err) {
      console.error("Follow action failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePinRoutine = async (routineId: string) => {
    if (!token) return;

    try {
      setPinLoadingId(routineId);

      const res = await fetch(`/api/user/me/pinned-routines/${routineId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to pin routine");
        return;
      }

      await refreshProfileContent();
      setShowPinnedManager(false);
    } catch (err) {
      console.error("Failed to pin routine:", err);
    } finally {
      setPinLoadingId(null);
    }
  };

  const handleUnpinRoutine = async (routineId: string) => {
    if (!token) return;

    try {
      setPinLoadingId(routineId);

      const res = await fetch(`/api/user/me/pinned-routines/${routineId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to unpin routine");
        return;
      }

      await refreshProfileContent();
    } catch (err) {
      console.error("Failed to unpin routine:", err);
    } finally {
      setPinLoadingId(null);
    }
  };

  const handleActivityClick = (activity: ProfileActivity) => {
    if (activity.entityType === "routine" && activity.entityId) {
      navigate(`/routines/${activity.entityId}`);
      return;
    }
  };

  const closeAllModals = () => {
    setShowPinnedManager(false);
    setShowAllCreated(false);
    setShowAllActivity(false);
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 md:px-8 py-10">
        <div className="flex flex-col gap-10 lg:flex-row">
          <aside className="w-full lg:w-[300px] lg:flex-shrink-0">
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <img
                src={profile.avatarUrl || "/assets/default-avatar.jpg"}
                className="h-36 w-36 rounded-full object-cover"
                alt={profile.username}
              />

              <div className="mt-6 space-y-4 text-sm">
                <div>
                  <p className="text-2xl font-bold">
                    {profile.name || profile.username}
                  </p>
                  <p className="text-base text-gray-500">@{profile.username}</p>
                </div>

                {currentUser === profile.username ? (
                  <button
                    className="w-full rounded-xl bg-gray-200 px-4 py-2.5 font-medium text-black transition hover:bg-black hover:text-white"
                    onClick={() => navigate("/settings/profile")}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button
                    className={`w-full rounded-xl px-4 py-2.5 font-medium text-white transition ${
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

                <div className="flex gap-8 pt-2">
                  <div>
                    <p className="text-lg font-bold">{profile.followerCount}</p>
                    <p className="text-gray-500">Followers</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">
                      {profile.followingCount}
                    </p>
                    <p className="text-gray-500">Following</p>
                  </div>
                </div>

                {profile.isPrivate && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
                    <p className="font-semibold">Private account</p>
                    <p className="mt-1 text-xs text-gray-500">
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
                          className="break-all text-blue-600 hover:underline"
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
          </aside>

          <main className="flex-1">
            <div className="rounded-3xl border border-black/10 bg-white p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-extrabold">
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
                  <p className="mt-4 leading-relaxed text-gray-700">
                    {profile.bio || "No bio available."}
                  </p>

                  <div className="my-8 border-b border-black/10" />

                  <section>
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold">
                          📌 Pinned Routines
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Featured routines shown on this profile
                        </p>
                      </div>

                      {profile.isOwnProfile && (
                        <button
                          onClick={() => setShowPinnedManager(true)}
                          className="rounded-xl border border-black/10 px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
                        >
                          Manage pins
                        </button>
                      )}
                    </div>

                    {contentLoading ? (
                      <p className="text-gray-500">
                        Loading pinned routines...
                      </p>
                    ) : pinnedRoutines.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-gray-600">
                        {profile.isOwnProfile
                          ? "You have not pinned any routines yet."
                          : "No pinned routines to show."}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {pinnedRoutines.map((routine) => (
                          <div
                            key={routine._id}
                            className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <Link
                                  to={`/routines/${routine._id}`}
                                  className="text-lg font-semibold hover:underline"
                                >
                                  {routine.title}
                                </Link>
                                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                                  {routine.description ||
                                    "No description added."}
                                </p>
                              </div>

                              {profile.isOwnProfile && (
                                <button
                                  onClick={() =>
                                    handleUnpinRoutine(routine._id)
                                  }
                                  disabled={pinLoadingId === routine._id}
                                  className="rounded-lg border border-black/10 px-3 py-1.5 text-sm hover:bg-gray-50"
                                >
                                  {pinLoadingId === routine._id
                                    ? "..."
                                    : "Unpin"}
                                </button>
                              )}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
                              <span className="rounded-full bg-gray-100 px-3 py-1">
                                {routine.difficulty}
                              </span>
                              <span className="rounded-full bg-gray-100 px-3 py-1">
                                {routine.durationMinutes} min
                              </span>
                              <span className="rounded-full bg-gray-100 px-3 py-1">
                                {routine.exercisesCount || 0} exercises
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="mt-12">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold">Created Routines</h2>
                        <p className="mt-1 text-sm text-gray-500">
                          A preview of this user&apos;s created plans
                        </p>
                      </div>

                      {createdRoutines.length > CREATED_PREVIEW_LIMIT && (
                        <button
                          onClick={() => setShowAllCreated(true)}
                          className="rounded-xl border border-black/10 px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
                        >
                          View all
                        </button>
                      )}
                    </div>

                    {contentLoading ? (
                      <p className="text-gray-500">
                        Loading created routines...
                      </p>
                    ) : createdRoutines.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-gray-600">
                        No created routines yet.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {previewCreatedRoutines.map((routine) => (
                          <div
                            key={routine._id}
                            className="rounded-2xl border border-black/10 bg-white p-4 transition hover:bg-gray-50"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <Link
                                  to={`/routines/${routine._id}`}
                                  className="text-lg font-semibold hover:underline"
                                >
                                  {routine.title}
                                </Link>
                                <p className="mt-1 text-sm text-gray-600">
                                  {routine.description ||
                                    "No description added."}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                                  <span className="rounded-full bg-gray-100 px-3 py-1">
                                    {routine.difficulty}
                                  </span>
                                  <span className="rounded-full bg-gray-100 px-3 py-1">
                                    {routine.durationMinutes} min
                                  </span>
                                  <span className="rounded-full bg-gray-100 px-3 py-1">
                                    {routine.likesCount || 0} likes
                                  </span>
                                  <span className="rounded-full bg-gray-100 px-3 py-1">
                                    {routine.savedByCount || 0} saves
                                  </span>
                                </div>
                              </div>

                              {profile.isOwnProfile && (
                                <button
                                  onClick={() =>
                                    routine.isPinned
                                      ? handleUnpinRoutine(routine._id)
                                      : handlePinRoutine(routine._id)
                                  }
                                  disabled={pinLoadingId === routine._id}
                                  className="rounded-lg border border-black/10 px-3 py-1.5 text-sm hover:bg-white"
                                >
                                  {pinLoadingId === routine._id
                                    ? "..."
                                    : routine.isPinned
                                      ? "Unpin"
                                      : "Pin"}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="mt-12">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold">Recent Activity</h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Latest visible activity on this profile
                        </p>
                      </div>

                      {recentActivity.length > ACTIVITY_PREVIEW_LIMIT && (
                        <button
                          onClick={() => setShowAllActivity(true)}
                          className="rounded-xl border border-black/10 px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
                        >
                          View more
                        </button>
                      )}
                    </div>

                    {contentLoading ? (
                      <p className="text-gray-500">Loading activity...</p>
                    ) : recentActivity.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-gray-600">
                        No recent activity to show.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {previewActivity.map((activity) => (
                          <button
                            key={activity._id}
                            type="button"
                            onClick={() => handleActivityClick(activity)}
                            className="w-full rounded-2xl border border-black/10 bg-white p-4 text-left transition hover:bg-gray-50"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {activity.title}
                                </p>
                                <p className="mt-1 text-sm text-gray-600">
                                  {activity.message}
                                </p>
                              </div>

                              <span className="whitespace-nowrap text-xs text-gray-500">
                                {formatDate(activity.createdAt)}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                </>
              ) : (
                <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-8">
                  <h2 className="text-2xl font-bold">
                    This profile is private
                  </h2>
                  <p className="mt-3 text-gray-600">
                    Follow this user to view their bio, routines, and activity.
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {showPinnedManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h3 className="text-xl font-bold">Manage pinned routines</h3>
                <p className="text-sm text-gray-500">
                  Pin routines you created or saved.
                </p>
              </div>
              <button
                onClick={closeAllModals}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
              {availableToPin.length === 0 ? (
                <p className="text-sm text-gray-600">
                  No routines available to pin.
                </p>
              ) : (
                <div className="space-y-3">
                  {availableToPin.map((routine) => (
                    <div
                      key={routine._id}
                      className="flex items-center justify-between rounded-xl border bg-white px-4 py-3"
                    >
                      <div>
                        <p className="font-medium">{routine.title}</p>
                        <p className="text-sm text-gray-500">
                          {routine.createdBy?.name ||
                            routine.createdBy?.username}
                        </p>
                      </div>

                      <button
                        onClick={() => handlePinRoutine(routine._id)}
                        disabled={pinLoadingId === routine._id}
                        className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90"
                      >
                        {pinLoadingId === routine._id ? "..." : "Pin"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showAllCreated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-xl font-bold">All created routines</h3>
              <button
                onClick={closeAllModals}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                {createdRoutines.map((routine) => (
                  <div
                    key={routine._id}
                    className="rounded-xl border bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          to={`/routines/${routine._id}`}
                          className="text-lg font-semibold hover:underline"
                        >
                          {routine.title}
                        </Link>
                        <p className="mt-1 text-sm text-gray-600">
                          {routine.description || "No description added."}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                          <span className="rounded-full bg-gray-100 px-3 py-1">
                            {routine.difficulty}
                          </span>
                          <span className="rounded-full bg-gray-100 px-3 py-1">
                            {routine.durationMinutes} min
                          </span>
                          <span className="rounded-full bg-gray-100 px-3 py-1">
                            {routine.likesCount || 0} likes
                          </span>
                          <span className="rounded-full bg-gray-100 px-3 py-1">
                            {routine.savedByCount || 0} saves
                          </span>
                        </div>
                      </div>

                      {profile.isOwnProfile && (
                        <button
                          onClick={() =>
                            routine.isPinned
                              ? handleUnpinRoutine(routine._id)
                              : handlePinRoutine(routine._id)
                          }
                          disabled={pinLoadingId === routine._id}
                          className="rounded-lg border border-black/10 px-3 py-1.5 text-sm hover:bg-gray-50"
                        >
                          {pinLoadingId === routine._id
                            ? "..."
                            : routine.isPinned
                              ? "Unpin"
                              : "Pin"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAllActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-xl font-bold">Recent activity</h3>
              <button
                onClick={closeAllModals}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <button
                    key={activity._id}
                    type="button"
                    onClick={() => handleActivityClick(activity)}
                    className="w-full rounded-xl border bg-white p-4 text-left transition hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {activity.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {activity.message}
                        </p>
                      </div>

                      <span className="whitespace-nowrap text-xs text-gray-500">
                        {formatDate(activity.createdAt)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
