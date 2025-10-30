import { Request, Response } from "express";
import { authlogin } from "../services/auth.services";

export const login = async (req: Request, res: Response) => {
  const loginData = req.body;

  const { accessToken, role } = await authlogin(loginData);

  res.cookie("careSyncAccessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24,
    domain: undefined,
  });

  return res.status(200).json({
    success: true,
    message: "Login successfull",
    role,
  });
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("careSyncAccessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    path: "/",
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
};
