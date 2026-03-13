import { Queue } from "bullmq";
import "dotenv/config";
export const ImageQueue = new Queue("imageQueue", {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
});
