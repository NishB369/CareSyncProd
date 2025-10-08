import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";

const ACCESS_SECRET = process.env.ACCESS_SECRET;

export const verifyAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.careSyncAccessToken;
  if (!accessToken) return false;
  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_SECRET!
    ) as JwtPayload;
    const { id, role } = decoded;
    req.user = { id, role };
    next();
    return true;
  } catch (err) {
    return false;
  }
};

export const generateTokens = async (
  id: string,
  role: string
): Promise<{ accessToken: string }> => {
  const accessToken = generateAccessToken(id, role);
  return { accessToken };
};

export const generateAccessToken = (id: string, role: string): string => {
  const accessToken = jwt.sign(
    { id, role },
    ACCESS_SECRET as unknown as string
  );

  return accessToken;
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};
