import nodemailer from "nodemailer";

const getMailerConfig = () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const secure = (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) === "true";

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port,
    secure,
    user,
    pass,
  };
};

export const hasMailerConfig = () => Boolean(getMailerConfig());

export const createMailer = () => {
  const config = getMailerConfig();

  if (!config) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
};

export const getDefaultMailFrom = () => process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || "";