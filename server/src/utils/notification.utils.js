import Notification from "../models/Notification.model.js";
import User from "../models/User.model.js";

const preferenceMap = {
  follow_request: "followRequests",
  follow: "follows",
  follow_accepted: "followAccepted",
  routine_created: "routineCreated",
  routine_liked: "likes",
  routine_commented: "comments",
  routine_saved: "saves",
};

export async function createNotification({
  recipient,
  actor = null,
  type,
  title,
  message,
  entityType = "none",
  entityId = null,
}) {
  if (!recipient) return null;
  if (actor && String(recipient) === String(actor)) return null;

  const recipientUser = await User.findById(recipient).select(
    "notificationPreferences",
  );

  if (!recipientUser) return null;

  const preferenceKey = preferenceMap[type];
  if (
    preferenceKey &&
    recipientUser.notificationPreferences &&
    recipientUser.notificationPreferences[preferenceKey] === false
  ) {
    return null;
  }

  return Notification.create({
    recipient,
    actor,
    type,
    title,
    message,
    entityType,
    entityId,
  });
}

export async function createNotificationsForFollowers({
  actorId,
  followers = [],
  routineId,
  actorUsername,
  routineTitle,
}) {
  if (!followers.length) return;

  const notifications = [];

  for (const followerId of followers) {
    if (String(followerId) === String(actorId)) continue;

    notifications.push(
      createNotification({
        recipient: followerId,
        actor: actorId,
        type: "routine_created",
        title: "New routine created",
        message: `${actorUsername} created a new routine: ${routineTitle}`,
        entityType: "routine",
        entityId: routineId,
      }),
    );
  }

  await Promise.all(notifications);
}
