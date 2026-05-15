import nodemailer from "nodemailer";
import { ENV } from "../config/env";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: ENV.GMAIL_USER,
    pass: ENV.APP_PASSWORD,
  },
});
