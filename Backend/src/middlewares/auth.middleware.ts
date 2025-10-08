import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/auth.utils";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isAccessTokenVerified = verifyAccessToken(req, res, next);
  if (isAccessTokenVerified) return;

  return res.status(401).json({
    success: false,
    message: "Authentication Required",
  });
};

export const requiresRole =
  (role: string[]) => (req: Request, res: Response, next: NextFunction) => {
    const customRole = req?.user?.role!;
    if (role.includes(customRole)) {
      next();
      return;
    }
    return res.status(403).send("UnAuthorised");
  };
