import { Resend } from "resend";
import dotenv from "dotenv";


dotenv.config();

export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const SENDER = {
  email: process.env.EMAIL_FROM || "onboarding@resend.dev",
  name: process.env.EMAIL_FROM_NAME || "BaatCheet",
};