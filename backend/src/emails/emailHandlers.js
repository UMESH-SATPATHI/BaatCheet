import { resend, SENDER } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "./emailTemplate.js";
import dotenv from "dotenv";

dotenv.config();

export const sendWelcomeEmail = async (email, name, clientUrl) => {
  if (!resend) {
    console.log("Resend API key is missing or invalid. Skipping welcome email sending.");
    return;
  }
  try {
    const finalClientUrl = clientUrl || process.env.CLIENT_URL || "http://localhost:5173";

    const { data, error } = await resend.emails.send({
      from: `${SENDER.name} <${SENDER.email}>`,
      to: email,
      subject: "Welcome to BaatCheet!",
      html: createWelcomeEmailTemplate(name, finalClientUrl),
    });

    if (error) {
      console.error("Failed to send welcome email via Resend:", error.message || error);
      return;
    }

    console.log(`Welcome email sent successfully to ${email}! ID: ${data?.id}`);
    return data;
  } catch (error) {
    console.error("Error sending welcome email via Resend:", error.message || error);
  }
};
