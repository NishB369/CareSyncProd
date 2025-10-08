import { prisma } from "../db/index";
import { UserRole } from "@prisma/client";

const findUserByIdAndRole = async (id: string, role?: UserRole) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      doctor: true,
      staff: true,
    },
  });

  if (!user) return null;

  if (role && user.role !== role) {
    console.warn(`⚠️ Role mismatch: expected ${role}, found ${user.role}`);
    return null;
  }

  return user;
};

export { findUserByIdAndRole };
