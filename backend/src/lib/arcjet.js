import arcjet, { shield, detectBot, tokenBucket, slidingWindow } from "@arcjet/node";
import dotenv from "dotenv";

dotenv.config();

export const arcjetProtection = process.env.ARCJET_KEY
  ? arcjet({
      key: process.env.ARCJET_KEY,
      characteristics: ["ip.src"],
      rules: [
        shield({ mode: "LIVE" }),
        detectBot({
          mode: "LIVE",
          allow: ["CATEGORY:SEARCH_ENGINE"],
        }),
        tokenBucket({
          mode: "LIVE",
          refillRate: 5,
          interval: 10,
          capacity: 10,
        }),
        slidingWindow({
          mode: "LIVE",
          max: 100,
          interval: 60,
        }),
      ],
    })
  : null;
