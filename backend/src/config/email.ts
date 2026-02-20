import nodemailer from "nodemailer";
import { config } from "./index.js";

let transporter: nodemailer.Transporter;

export async function getEmailTransporter() {
  if (transporter) return transporter;

  // In dev with no SMTP creds, create an Ethereal test account
  if (config.NODE_ENV === "development" && !config.SMTP_USER) {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_PORT === 465,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
  });

  return transporter;
}
