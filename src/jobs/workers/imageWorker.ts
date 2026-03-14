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
      console.log(`Optimization starting for job ${job.id}: ${filePath}`);
      await sharp(filePath)
        .resize(width, height)
        .webp({ quality })
        .toFile(optimizeImagePath);
      console.log(`Optimization finished for job ${job.id}`);
    } catch (error) {
      console.error(`Error optimizing image ${fileName}:`, error);
      throw error; // Re-throw so BullMQ knows it failed
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
