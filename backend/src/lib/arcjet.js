import arcjet, { shield, detectBot, tokenBucket, slidingWindow } from "@arcjet/node";
import dotenv from "dotenv";

dotenv.config();

const mode = process.env.ARCJET_MODE === "LIVE" ? "LIVE" : "DRY_RUN";

export const arcjetProtection = process.env.ARCJET_KEY
  ? arcjet({
      key: process.env.ARCJET_KEY,
      characteristics: ["ip.src"],
      rules: [
        shield({ mode }),
        detectBot({
          mode,
          allow: ["CATEGORY:SEARCH_ENGINE"],
        }),
        tokenBucket({
          mode,
          refillRate: 10,
          interval: 10,
          capacity: 50,
        }),
        slidingWindow({
          mode,
          max: 200,
          interval: 60,
        }),
      ],
    })
  : null;
