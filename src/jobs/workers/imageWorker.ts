import { Worker } from "bullmq";
import "dotenv/config";
import path from "path";
import sharp, { concurrency } from "sharp";

export const ImageWorker = new Worker(
  "imageQueue",
  async (job) => {
    const { filePath, fileName, width, height, quality } = job.data;
    const optimizeImagePath = path.join(
      process.cwd(),
      "uploads",
      "optimize",
      fileName,
    );

    try {
      await sharp(filePath)
        .resize(width, height)
        .webp({ quality })
        .toFile(optimizeImagePath);
    } catch (error) {
      console.log(error);
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      maxRetriesPerRequest: null,
    },
    // concurrency: 5,
  },
);
ImageWorker.on("completed", (job) => {
  console.log(`Job with ID ${job.id} has been completed`);
});
ImageWorker.on("failed", (job: any, err) => {
  console.log(`Job with ID ${job.id} has failed with error: ${err.message}`);
});
