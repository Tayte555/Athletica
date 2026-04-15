import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell } from "lucide-react";
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

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(
    null,
  );
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    if (!token) return;

    try {
      const res = await fetch("/api/notifications?limit=10", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setItems(data.items || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 10,
        left: rect.right - 380,
      });
      fetchNotifications();
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

  const markAsRead = async (notificationId: string) => {
    if (!token) return;

    try {
      const res = await fetch("/api/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationId }),
      });

      const data = await res.json();

      setItems((prev) =>
        prev.map((item) =>
          item._id === notificationId ? { ...item, isRead: true } : item,
        ),
      );
      setUnreadCount(data.unreadCount ?? 0);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

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
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
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

      await fetchNotifications();
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

    setOpen(false);

    if (item.entityType === "routine" && item.entityId) {
      navigate(`/routines/${item.entityId}`);
      return;
    }

    if (item.entityType === "profile" && item.actor?.username) {
      navigate(`/${item.actor.username}`);
      return;
    }

    navigate("/settings/notifications");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative mr-5 rounded-full p-2 transition hover:bg-white/10"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: position.top,
              left: position.left,
            }}
            className="z-[9999] w-[380px] overflow-hidden rounded-2xl border border-black/10 bg-white text-black shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
              <h3 className="text-base font-semibold">Notifications</h3>
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:underline"
              >
                Mark all read
              </button>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-5 text-sm text-gray-500">
                  No notifications yet.
                </div>
              ) : (
                items.map((item) => {
                  const isFollowRequest =
                    item.type === "follow_request" && item.actor?._id;

                  const isProcessing = processingRequestId === item._id;

                  return (
                    <div
                      key={item._id}
                      className={`w-full border-b border-black/5 px-4 py-4 text-left ${
                        item.isRead ? "bg-white" : "bg-blue-50/60"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleNotificationClick(item)}
                        className="w-full text-left transition hover:bg-gray-50"
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

                          <div className="min-w-0 flex-1">
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
                              {formatTime(item.createdAt)}
                            </p>
                          </div>

                          {!item.isRead && (
                            <span className="mt-2 h-2.5 w-2.5 rounded-full bg-blue-600" />
                          )}
                        </div>
                      </button>

                      {isFollowRequest && (
                        <div className="mt-4 ml-[52px] flex gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollowRequestAction(item, "accept");
                            }}
                            disabled={isProcessing}
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                          >
                            {isProcessing ? "Processing..." : "Accept"}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollowRequestAction(item, "decline");
                            }}
                            disabled={isProcessing}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/settings/notifications");
              }}
              className="w-full bg-gray-50 px-4 py-3 text-sm font-medium hover:bg-gray-100"
            >
              View all notifications
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
