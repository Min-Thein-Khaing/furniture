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

export const clearDirectory = async (directoryPath: string) => {
  if (!fs.existsSync(directoryPath)) return;

  try {
    const files = await fs.promises.readdir(directoryPath);
    for (const file of files) {
      if (file === ".gitkeep") continue;
      const filePath = path.join(directoryPath, file);
      try {
        const stats = await fs.promises.stat(filePath);
        if (stats.isFile()) {
          await fs.promises.unlink(filePath);
        } else {
          await fs.promises.rm(filePath, { recursive: true, force: true });
        }
      } catch (fileError: any) {
        if (fileError.code === "EBUSY") {
          console.warn(
            `Skipping busy file: ${file}. Please close any app using it.`,
          );
        } else {
          console.error(`Failed to delete ${file}:`, fileError.message);
        }
      }
    }
  } catch (error) {
    console.error(`Error clearing directory ${directoryPath}:`, error);
  }
};


export const clearUploads = async () => {
  const imagesPath = path.join(process.cwd(), "uploads", "images");
  const optimizePath = path.join(process.cwd(), "uploads", "optimize");

  await clearDirectory(imagesPath);
  await clearDirectory(optimizePath);
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