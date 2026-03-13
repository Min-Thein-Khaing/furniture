import { prisma } from "../lib/prisma.js";

export const getNumberPhone = async (phone: string) => {
  return await prisma.user.findUnique({
    where: {
      phone,
    },
  });
};

export const createOtp = async (otpData: any) => {
  return await prisma.otp.create({
    data: otpData,
  });
};
export const getNumberPhoneOtp = async (phone: string) => {
  return await prisma.otp.findUnique({
    where: {
      phone,
    },
  });
};
export const updateOtp = async (id: number, otpUpdateData: any) => {
  return await prisma.otp.update({
    where: {
      id,
    },
    data: otpUpdateData,
  });
};
export const createUser = async (userData: any) => {
  return await prisma.user.create({
    data: userData,
  });
};
export const updateUser = async (userData: any, id: number) => {
  return await prisma.user.update({
    where: {
      id,
    },
    data: userData,
  });
};

export const getNumberId = async (id:number) => {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
};
