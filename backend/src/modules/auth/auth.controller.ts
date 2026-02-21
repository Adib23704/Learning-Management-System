import type { CookieOptions, Request, Response } from "express";
import { UnauthorizedError } from "../../common/errors/index.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/response.js";
import { config } from "../../config/index.js";
import { authService } from "./auth.service.js";

const REFRESH_COOKIE = "refresh_token";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: config.NODE_ENV === "production" ? "strict" : "lax",
  path: "/api/v1/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, cookieOptions);
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, cookieOptions);
}

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await authService.register(
      req.body,
    );
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, { user, accessToken }, 201);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await authService.login(
      req.body,
    );
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, { user, accessToken });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const rawToken = req.cookies[REFRESH_COOKIE];
    if (!rawToken) {
      throw new UnauthorizedError("No refresh token provided");
    }

    const { user, accessToken, refreshToken } =
      await authService.refresh(rawToken);
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, { user, accessToken });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const rawToken = req.cookies[REFRESH_COOKIE];
    if (rawToken) {
      await authService.logout(rawToken);
    }
    clearRefreshCookie(res);
    sendSuccess(res, { message: "Logged out successfully" });
  }),

  getMe: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getMe(req.user!.id);
    sendSuccess(res, user);
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.updateProfile(req.user!.id, req.body);
    sendSuccess(res, user);
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.changePassword(req.user!.id, req.body);
    clearRefreshCookie(res);
    sendSuccess(res, { message: "Password changed. Please log in again." });
  }),
};
