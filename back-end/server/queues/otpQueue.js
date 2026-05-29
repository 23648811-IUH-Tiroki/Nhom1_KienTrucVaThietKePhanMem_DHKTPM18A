import { Queue } from "bullmq";
import queueRedis from "../configs/queueRedis.js";

export const OTP_QUEUE_NAME = "otpQueue";

export const otpQueue = new Queue(OTP_QUEUE_NAME, {
  connection: queueRedis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
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

export const enqueueOtpEmail = (payload) => {
  return otpQueue.add("send-otp-email", payload, {
    priority: payload?.priority || 5,
  });
};

export default otpQueue;