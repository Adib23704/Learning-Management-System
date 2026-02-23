import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { config } from "./config/index.js";
import { logger } from "./config/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { requestId } from "./middleware/requestId.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import categoryRoutes from "./modules/category/category.routes.js";
import courseRoutes from "./modules/course/course.routes.js";
import enrollmentRoutes from "./modules/enrollment/enrollment.routes.js";
import lessonRoutes from "./modules/lesson/lesson.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import userRoutes from "./modules/user/user.routes.js";

const app: Express = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGINS,
    credentials: true,
  }),
);

app.use(requestId);

app.use(
  pinoHttp({
    logger,
    customProps: (req) => ({ requestId: req.id }),
    autoLogging: { ignore: (req) => req.url === "/health" },
  }),
);

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({
    name: "LMS API",
    version: "1.0.0",
    status: "running",
    docs: "/api/v1",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/courses/:courseId/lessons", lessonRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

export { app };
