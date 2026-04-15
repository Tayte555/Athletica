import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  type: string;
  entityType: "profile" | "routine" | "comment" | "none";
  entityId?: string | null;
  isRead: boolean;
  createdAt: string;
  actor?: {
    _id?: string;
    username?: string;
    name?: string;
    avatar?: string;
  } | null;
};

type NotificationPreferences = {
  followRequests: boolean;
  follows: boolean;
  followAccepted: boolean;
  routineCreated: boolean;
  likes: boolean;
  comments: boolean;
  saves: boolean;
};

const PAGE_SIZE = 10;

export default function NotificationsSettings() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    followRequests: true,
    follows: true,
    followAccepted: true,
    routineCreated: true,
    likes: true,
    comments: true,
    saves: true,
  });

  const [saving, setSaving] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(
    null,
  );
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextOffset, setNextOffset] = useState(0);

  const fetchPreferences = async () => {
    if (!token) return;

    try {
      const userRes = await fetch("/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = await userRes.json();

      setPreferences({
        followRequests:
          userData.notificationPreferences?.followRequests ?? true,
        follows: userData.notificationPreferences?.follows ?? true,
        followAccepted:
          userData.notificationPreferences?.followAccepted ?? true,
        routineCreated:
          userData.notificationPreferences?.routineCreated ?? true,
        likes: userData.notificationPreferences?.likes ?? true,
        comments: userData.notificationPreferences?.comments ?? true,
        saves: userData.notificationPreferences?.saves ?? true,
      });
    } catch (error) {
      console.error("Failed to fetch notification preferences:", error);
    }
  };

  const fetchNotifications = async (offset = 0, append = false) => {
    if (!token) return;

    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoadingNotifications(true);
      }

      const res = await fetch(
        `/api/notifications?limit=${PAGE_SIZE}&offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json();

      setItems((prev) =>
        append ? [...prev, ...(data.items || [])] : data.items || [],
      );
      setHasMore(Boolean(data.hasMore));
      setNextOffset(data.nextOffset ?? 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoadingNotifications(false);
      setLoadingMore(false);
    }
  };

  const refreshNotificationsFromStart = async () => {
    await fetchNotifications(0, false);
  };

  useEffect(() => {
    fetchPreferences();
    fetchNotifications(0, false);
  }, []);

  const markAllAsRead = async () => {
    if (!token) return;

    try {
      await fetch("/api/notifications/read-all", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!token) return;

    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationId }),
      });

      setItems((prev) =>
        prev.map((item) =>
          item._id === notificationId ? { ...item, isRead: true } : item,
        ),
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleSavePreferences = async () => {
    if (!token) return;

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("notificationPreferences", JSON.stringify(preferences));

      await fetch("/api/user/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      alert("Notification preferences updated");
    } catch (error) {
      console.error("Failed to save notification preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleFollowRequestAction = async (
    notification: NotificationItem,
    action: "accept" | "decline",
  ) => {
    if (!token || !notification.actor?._id) return;

    try {
      setProcessingRequestId(notification._id);

      const res = await fetch(
        `/api/user/follow-requests/${notification.actor._id}/${action}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || `Failed to ${action} request`);
        return;
      }

      await refreshNotificationsFromStart();

      if (action === "accept") {
        alert("Follow request accepted");
      } else {
        alert("Follow request declined");
      }
    } catch (error) {
      console.error(`Failed to ${action} follow request:`, error);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      await markAsRead(item._id);
    }

    if (item.entityType === "routine" && item.entityId) {
      navigate(`/routines/${item.entityId}`);
      return;
    }

    if (item.entityType === "profile" && item.actor?.username) {
      navigate(`/${item.actor.username}`);
      return;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="border-b border-black pb-2 text-xl font-medium">
          Notifications
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_1fr]">
        <div className="rounded-2xl border p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Recent notifications</h2>
              <p className="mt-1 text-sm text-gray-500">
                Your most recent activity updates.
              </p>
            </div>

            <button
              type="button"
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:underline"
            >
              Mark all as read
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {loadingNotifications ? (
              <p className="text-sm text-gray-500">Loading notifications...</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-gray-500">No notifications yet.</p>
            ) : (
              items.map((item) => {
                const isFollowRequest =
                  item.type === "follow_request" && item.actor?._id;

                const isProcessing = processingRequestId === item._id;

                return (
                  <div
                    key={item._id}
                    className={`rounded-xl border p-4 ${
                      item.isRead ? "bg-white" : "bg-blue-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          item.actor?.avatar
                            ? `http://localhost:5555${item.actor.avatar}`
                            : "/assets/default-avatar.jpg"
                        }
                        alt="avatar"
                        className="h-10 w-10 rounded-full object-cover"
                      />

                      <div className="flex-1">
                        <button
                          type="button"
                          onClick={() => handleNotificationClick(item)}
                          className="w-full text-left"
                        >
                          <p className="font-semibold">{item.title}</p>
                          <p className="text-sm text-gray-500">
                            {item.actor?.username && (
                              <span className=" text-black">
                                @{item.actor.username}
                              </span>
                            )}{" "}
                            {item.message.replace(
                              item.actor?.username || "",
                              "",
                            )}
                          </p>
                          <p className="mt-2 text-xs text-gray-400">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </button>

                        {isFollowRequest && (
                          <div className="mt-4 flex gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleFollowRequestAction(item, "accept")
                              }
                              disabled={isProcessing}
                              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                            >
                              {isProcessing ? "Processing..." : "Accept"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleFollowRequestAction(item, "decline")
                              }
                              disabled={isProcessing}
                              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>

                      {!item.isRead && (
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {!loadingNotifications && hasMore && (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => fetchNotifications(nextOffset, true)}
                disabled={loadingMore}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
              >
                {loadingMore ? "Loading..." : "Load older notifications"}
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border p-5 h-fit">
          <h2 className="text-lg font-semibold">Notification preferences</h2>
          <p className="mt-1 text-sm text-gray-500">
            Choose which notifications you want to receive.
          </p>

          <div className="mt-5 space-y-4">
            {[
              ["followRequests", "Follow requests"],
              ["follows", "New followers"],
              ["followAccepted", "Accepted follow requests"],
              ["routineCreated", "New routines from people I follow"],
              ["likes", "Routine likes"],
              ["comments", "Routine comments"],
              ["saves", "Routine saves"],
            ].map(([key, label]) => {
              const prefKey = key as keyof NotificationPreferences;

              return (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl border px-4 py-3"
                >
                  <span>{label}</span>
                  <button
                    type="button"
                    onClick={() => toggle(prefKey)}
                    className={`relative h-7 w-14 rounded-full transition ${
                      preferences[prefKey] ? "bg-gray-900" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                        preferences[prefKey] ? "left-8" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleSavePreferences}
            disabled={saving}
            className="mt-5 rounded-lg bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
