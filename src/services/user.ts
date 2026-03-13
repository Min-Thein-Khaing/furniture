import { prisma } from "../lib/prisma.js";

export const getAllUsers = async () => {
  return await prisma.user.findMany();
};