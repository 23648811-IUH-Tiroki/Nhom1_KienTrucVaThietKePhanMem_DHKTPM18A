import { Worker } from "bullmq";
import queueRedis from "../configs/queueRedis.js";
import { logger } from "../logger/logger.js";
import { createMailer, getDefaultMailFrom, hasMailerConfig } from "../utils/mailer.js";

const sendNotificationEmail = async (jobData) => {
  if (!hasMailerConfig()) {
    if (process.env.NODE_ENV !== "production") {
      logger.info("Notification email skipped because SMTP is not configured in non-production", {
        recipient: jobData.to,
      });
      return;
    }

    throw new Error("SMTP is not configured for notification queue processing.");
  }

  const mailer = createMailer();
  if (!mailer) {
    throw new Error("Unable to initialize mailer for notification queue processing.");
  }

  await mailer.sendMail({
    from: jobData.from || getDefaultMailFrom(),
    to: jobData.to,
    subject: jobData.subject,
    text: jobData.text,
    html: jobData.html,
  });
};

export const startNotificationWorker = () => {
  const worker = new Worker(
    "notificationQueue",
    async (job) => {
      logger.info("Processing notification job", {
        jobId: job.id,
        recipient: job.data.to,
        channel: job.data.channel || "email",
      });

      await sendNotificationEmail(job.data);

      return {
        deliveredTo: job.data.to,
        channel: job.data.channel || "email",
      };
    },
    {
      connection: queueRedis,
      concurrency: Number(process.env.NOTIFICATION_WORKER_CONCURRENCY || 2),
    },
  );

  worker.on("completed", (job) => {
    logger.info("Notification job completed", {
      jobId: job.id,
      recipient: job.data.to,
    });
  });

  worker.on("failed", (job, error) => {
    logger.error("Notification job failed", {
      jobId: job?.id,
      recipient: job?.data?.to,
      message: error.message,
    });
  });

  return worker;
};