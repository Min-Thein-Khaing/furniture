import { prisma } from "../lib/prisma.js";
export const getSettingStatus = async (key: string) => {
  return await prisma.setting.findUnique({
    where: {
      key,
    },
  });
};

export const createOrUpdateSetting = async (key: string, value: string) => {
  return await prisma.setting.upsert({
    where: {
      key,
    },
    update: {
      value,
    },
    create: {
      key,
      value,
    },
  });
};
