import { useEffect, useState } from "react";

type AdminUser = {
  _id: string;
  username: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin: boolean;
  isPrivate: boolean;
  isSuspended: boolean;
  suspendedAt?: string | null;
  suspensionReason?: string;
  followerCount?: number;
  followingCount?: number;
  createdAt?: string;
};

type ModerationRoutine = {
  _id: string;
  title: string;
  description: string;
  isPublic: boolean;
  isHidden: boolean;
  isFlagged: boolean;
  moderationNote?: string;
  lastModeratedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    username?: string;
    name?: string;
  };
};

type ModerationComment = {
  _id: string;
  text: string;
  isHidden: boolean;
  isFlagged: boolean;
  moderationNote?: string;
  lastModeratedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    username?: string;
    name?: string;
  };
  routine?: {
    title?: string;
  };
};

type AdminLog = {
  _id: string;
  action: string;
  targetType: string;
  details: string;
  createdAt: string;
  admin?: {
    username?: string;
    name?: string;
  };
};

type ModerationResponse<T> = {
  items: T[];
  total: number;
  limit: number;
  filter: string;
};

export default function AdminSettings() {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userSearch, setUserSearch] = useState("");

  const [routines, setRoutines] = useState<ModerationRoutine[]>([]);
  const [routineTotal, setRoutineTotal] = useState(0);

  const [comments, setComments] = useState<ModerationComment[]>([]);
  const [commentTotal, setCommentTotal] = useState(0);

  const [logs, setLogs] = useState<AdminLog[]>([]);

  const [routineFilter, setRoutineFilter] = useState("queue");
  const [commentFilter, setCommentFilter] = useState("queue");

  const fetchMe = async () => {
    if (!token) return false;

    const res = await fetch("/api/user/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return false;

    const data = await res.json();
    setIsAdmin(Boolean(data.isAdmin));
    return Boolean(data.isAdmin);
  };

  const fetchUsers = async (search = "") => {
    if (!token) return;

    const res = await fetch(
      `/api/admin/users?q=${encodeURIComponent(search)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!res.ok) return;
    const data = await res.json();
    setUsers(data || []);
  };

  const fetchRoutines = async (filter = "queue") => {
    if (!token) return;

    const res = await fetch(
      `/api/admin/moderation/routines?filter=${filter}&limit=20`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!res.ok) return;

    const data: ModerationResponse<ModerationRoutine> = await res.json();
    setRoutines(data.items || []);
    setRoutineTotal(data.total || 0);
  };

  const fetchComments = async (filter = "queue") => {
    if (!token) return;

    const res = await fetch(
      `/api/admin/moderation/comments?filter=${filter}&limit=20`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!res.ok) return;

    const data: ModerationResponse<ModerationComment> = await res.json();
    setComments(data.items || []);
    setCommentTotal(data.total || 0);
  };

  const fetchLogs = async () => {
    if (!token) return;

    const res = await fetch("/api/admin/logs?limit=30", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return;
    const data = await res.json();
    setLogs(data || []);
  };

  const refreshAll = async () => {
    await Promise.all([
      fetchUsers(userSearch),
      fetchRoutines(routineFilter),
      fetchComments(commentFilter),
      fetchLogs(),
    ]);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const allowed = await fetchMe();

      if (allowed) {
        await Promise.all([
          fetchUsers(),
          fetchRoutines(),
          fetchComments(),
          fetchLogs(),
        ]);
      }

      setLoading(false);
    };

    init();
  }, []);

  const updateUser = async (
    userId: string,
    body: {
      isAdmin?: boolean;
      isSuspended?: boolean;
      suspensionReason?: string;
    },
  ) => {
    if (!token) return;

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to update user");
      return;
    }

    await refreshAll();
  };

  const deleteUser = async (userId: string) => {
    if (!token) return;
    if (!confirm("Delete this user?")) return;

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to delete user");
      return;
    }

    await refreshAll();
  };

  const updateRoutine = async (
    routineId: string,
    body: { isHidden?: boolean; isFlagged?: boolean; moderationNote?: string },
  ) => {
    if (!token) return;

    const res = await fetch(`/api/admin/routines/${routineId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to update routine");
      return;
    }

    await refreshAll();
  };

  const deleteRoutine = async (routineId: string) => {
    if (!token) return;
    if (!confirm("Delete this routine?")) return;

    const res = await fetch(`/api/admin/routines/${routineId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to delete routine");
      return;
    }

    await refreshAll();
  };

  const updateComment = async (
    commentId: string,
    body: { isHidden?: boolean; isFlagged?: boolean; moderationNote?: string },
  ) => {
    if (!token) return;

    const res = await fetch(`/api/admin/comments/${commentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to update comment");
      return;
    }

    await refreshAll();
  };

  const deleteComment = async (commentId: string) => {
    if (!token) return;
    if (!confirm("Delete this comment?")) return;

    const res = await fetch(`/api/admin/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to delete comment");
      return;
    }

    await refreshAll();
  };

  if (loading) {
    return <div>Loading admin panel...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-xl font-semibold">Admin</h1>
        <p className="mt-2 text-sm text-gray-700">
          You do not have access to this section.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="border-b border-black pb-2 text-xl font-medium">
          Admin
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          Manage user accounts, moderate routines and comments, and review admin
          activity logs.
        </p>
      </div>

      <section className="rounded-2xl border bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Manage User Accounts</h2>
            <p className="text-sm text-gray-500">
              View all users, grant admin access, suspend or delete accounts.
            </p>
          </div>

          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search users..."
            className="rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div className="mb-4">
          <button
            onClick={() => fetchUsers(userSearch)}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white"
          >
            Search
          </button>
        </div>

        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user._id}
              className="rounded-xl border border-black/10 p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-semibold">
                    {user.name || user.username}{" "}
                    <span className="text-gray-500">@{user.username}</span>
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-gray-100 px-3 py-1">
                      {user.isAdmin ? "Admin" : "Standard user"}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1">
                      {user.isSuspended ? "Suspended" : "Active"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      updateUser(user._id, { isAdmin: !user.isAdmin })
                    }
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    {user.isAdmin ? "Remove admin" : "Make admin"}
                  </button>

                  <button
                    onClick={() =>
                      updateUser(user._id, {
                        isSuspended: !user.isSuspended,
                        suspensionReason: user.isSuspended
                          ? ""
                          : "Suspended by admin",
                      })
                    }
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    {user.isSuspended ? "Unsuspend" : "Suspend"}
                  </button>

                  <button
                    onClick={() => deleteUser(user._id)}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <p className="text-sm text-gray-500">No users found.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Routine Review Queue</h2>
            <p className="text-sm text-gray-500">
              Hide content, flag items, approve reviewed routines, and revisit
              updated content.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Showing {routines.length} of {routineTotal} routines.
            </p>
          </div>

          <select
            value={routineFilter}
            onChange={(e) => {
              setRoutineFilter(e.target.value);
              fetchRoutines(e.target.value);
            }}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="queue">Needs review</option>
            <option value="flagged">Flagged</option>
            <option value="hidden">Hidden</option>
            <option value="all">All</option>
          </select>
        </div>

        <div className="space-y-3">
          {routines.map((routine) => (
            <div
              key={routine._id}
              className="rounded-xl border border-black/10 p-4"
            >
              <p className="font-semibold">{routine.title}</p>
              <p className="text-sm text-gray-500">
                by {routine.createdBy?.name || routine.createdBy?.username}
              </p>
              <p className="mt-2 text-sm text-gray-700">
                {routine.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    updateRoutine(routine._id, { isHidden: !routine.isHidden })
                  }
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  {routine.isHidden ? "Unhide" : "Hide"}
                </button>

                <button
                  onClick={() =>
                    updateRoutine(routine._id, {
                      isFlagged: !routine.isFlagged,
                    })
                  }
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  {routine.isFlagged ? "Unflag" : "Flag"}
                </button>

                <button
                  onClick={() =>
                    updateRoutine(routine._id, {
                      isFlagged: false,
                      isHidden: false,
                      moderationNote: "",
                    })
                  }
                  className="rounded-lg bg-black px-3 py-2 text-sm text-white"
                >
                  Approve
                </button>

                <button
                  onClick={() => deleteRoutine(routine._id)}
                  className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {routines.length === 0 && (
            <p className="text-sm text-gray-500">No routines found.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Comment Review Queue</h2>
            <p className="text-sm text-gray-500">
              Hide comments, flag them, approve reviewed ones, and revisit
              updated content.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Showing {comments.length} of {commentTotal} comments.
            </p>
          </div>

          <select
            value={commentFilter}
            onChange={(e) => {
              setCommentFilter(e.target.value);
              fetchComments(e.target.value);
            }}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="queue">Needs review</option>
            <option value="flagged">Flagged</option>
            <option value="hidden">Hidden</option>
            <option value="all">All</option>
          </select>
        </div>

        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="rounded-xl border border-black/10 p-4"
            >
              <p className="text-sm font-medium">
                {comment.user?.name || comment.user?.username} on{" "}
                {comment.routine?.title || "Routine"}
              </p>
              <p className="mt-2 text-sm text-gray-700">{comment.text}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    updateComment(comment._id, { isHidden: !comment.isHidden })
                  }
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  {comment.isHidden ? "Unhide" : "Hide"}
                </button>

                <button
                  onClick={() =>
                    updateComment(comment._id, {
                      isFlagged: !comment.isFlagged,
                    })
                  }
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  {comment.isFlagged ? "Unflag" : "Flag"}
                </button>

                <button
                  onClick={() =>
                    updateComment(comment._id, {
                      isFlagged: false,
                      isHidden: false,
                      moderationNote: "",
                    })
                  }
                  className="rounded-lg bg-black px-3 py-2 text-sm text-white"
                >
                  Approve
                </button>

                <button
                  onClick={() => deleteComment(comment._id)}
                  className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-sm text-gray-500">No comments found.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">System Activity Logs</h2>
            <p className="text-sm text-gray-500">
              Admin actions with timestamps for safety and accountability.
            </p>
          </div>

          <button
            onClick={fetchLogs}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Refresh logs
          </button>
        </div>

        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log._id}
              className="rounded-xl border border-black/10 p-4"
            >
              <p className="font-medium">{log.action}</p>
              <p className="mt-1 text-sm text-gray-600">{log.details}</p>
              <p className="mt-2 text-xs text-gray-500">
                by {log.admin?.name || log.admin?.username || "Admin"} •{" "}
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
          ))}

          {logs.length === 0 && (
            <p className="text-sm text-gray-500">No logs found.</p>
          )}
        </div>
      </section>
    </div>
  );
}
