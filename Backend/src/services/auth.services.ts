import { AppError } from "../utils/AppError";
import bcrypt from "bcryptjs";
import { generateTokens } from "../utils/auth.utils";
import { prisma } from "../db/index";

interface LoginProps {
  email: string;
  password: string;
}

const authlogin = async ({ email, password }: LoginProps) => {
  const user = await prisma?.user.findFirst({
    where: { email },
  });

  if (!user) throw new AppError("User does not exist", 404);



  const tokens = await generateTokens(user.id, user.role);
  return { ...tokens, role: user.role };
};

export {authlogin}
