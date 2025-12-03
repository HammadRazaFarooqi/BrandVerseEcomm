// utils/mailer.js
import nodemailer from "nodemailer";

const ADMIN_EMAIL = "affimall50@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: ADMIN_EMAIL, pass: ADMIN_PASSWORD },
});

export const sendMail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Affi Mall" <${ADMIN_EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Email sending error:", error);
  }
};
