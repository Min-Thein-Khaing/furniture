import fs from "fs";
import path from "node:path";
import { promisify } from "util";
import { ImageQueue } from "../jobs/queues/imageQueue.js";

const unlinkAsync = promisify(fs.unlink);

export const deleteFile = async (filePath?: string) => {
  if (!filePath) return;

  try {
    if (fs.existsSync(filePath)) {
      await unlinkAsync(filePath);
    }
  } catch (error) {
    console.error("File delete error:", error);
  }
};

export const deletePostImages = async (imageName: string) => {
  const originalPath = path.join(
    process.cwd(),
    "uploads",
    "images",
    imageName
  );

  const optimizePath = path.join(
    process.cwd(),
    "uploads",
    "optimize",
    imageName.split(".")[0] + ".webp"
  );

  await deleteFile(originalPath);
  await deleteFile(optimizePath);
};

export const optimizeImage = async (file: Express.Multer.File) => {
  const splitFilePath = file.filename.split(".")[0];

  await ImageQueue.add(
    "optimizeImage",
    {
      filePath: file.path,
      fileName: splitFilePath + ".webp",
      width: 835,
      height: 577,
      quality: 100,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    }
  );
};