import { arcjetProtection } from "../lib/arcjet.js";

export const arcjetMiddleware = async (req, res, next) => {
  if (!arcjetProtection) {
    return next();
  }

  // Never block essential authentication routes
  if (req.path.startsWith("/auth")) {
    return next();
  }

  try {
    const decision = await arcjetProtection.protect(req, { requested: 1 });

    if (decision.isDenied()) {
      const statusCode = decision.reason.isRateLimit()
        ? 429
        : 403;

      return res.status(statusCode).json({
        message:
          statusCode === 429
            ? "Too many requests. Please try again later."
            : "Request blocked by security policy.",
      });
    }

    next();
  } catch (error) {
    console.error("Arcjet request protection failed:", error.message);
    next();
  }
};