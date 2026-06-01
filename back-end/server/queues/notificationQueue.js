import { Queue } from "bullmq";
import queueRedis from "../configs/queueRedis.js";

export const NOTIFICATION_QUEUE_NAME = "notificationQueue";

export const notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
  connection: queueRedis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "fixed",
      delay: 5000,
    },
    removeOnComplete: {
      age: 60 * 60,
      count: 100,
    },
    removeOnFail: {
      age: 24 * 60 * 60,
      count: 100,
    },
  },
});

export const enqueueNotificationEmail = (payload) => {
  return notificationQueue.add("send-notification-email", payload, {
    priority: payload?.priority || 5,
  });
};

export default notificationQueue;