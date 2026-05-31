import { Worker } from "bullmq";
import queueRedis from "../configs/queueRedis.js";
import { logger } from "../logger/logger.js";
import { createMailer, getDefaultMailFrom, hasMailerConfig } from "../utils/mailer.js";

const sendOtpEmail = async (jobData) => {
  if (!hasMailerConfig()) {
    if (process.env.NODE_ENV !== "production") {
      logger.info("OTP email skipped because SMTP is not configured in non-production", {
        email: jobData.email,
        purpose: jobData.purpose,
      });
      return;
    }

    throw new Error("SMTP is not configured for OTP queue processing.");
  }

  const mailer = createMailer();
  if (!mailer) {
    throw new Error("Unable to initialize mailer for OTP queue processing.");
  }

  await mailer.sendMail({
    from: jobData.from || getDefaultMailFrom(),
    to: jobData.email,
    subject: jobData.subject,
    text: jobData.text,
    html: jobData.html,
  });
};

export const startOtpWorker = () => {
  const worker = new Worker(
    "otpQueue",
    async (job) => {
      logger.info("Processing OTP job", {
        jobId: job.id,
        email: job.data.email,
        purpose: job.data.purpose,
      });

      await sendOtpEmail(job.data);

      return {
        deliveredTo: job.data.email,
        purpose: job.data.purpose,
      };
    },
    {
      connection: queueRedis,
      concurrency: Number(process.env.OTP_WORKER_CONCURRENCY || 2),
    },
  );

  worker.on("completed", (job) => {
    logger.info("OTP job completed", {
      jobId: job.id,
      email: job.data.email,
    });
  });

  worker.on("failed", (job, error) => {
    logger.error("OTP job failed", {
      jobId: job?.id,
      email: job?.data?.email,
      message: error.message,
    });
  });

  return worker;
};