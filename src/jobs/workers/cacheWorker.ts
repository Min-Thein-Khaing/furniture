import {  Worker } from "bullmq";
import { redis } from "../../utils/cache.js";
export const CacheWorker = new Worker(
  "cache-invalidation",
  async (job) => {
    const { pattern } = job.data;
    try {
      await invalidateCache(pattern);
    } catch (error) {
      console.error(`Error invalidating cache for pattern ${pattern}:`, error);
      throw error; // Re-throw so BullMQ knows it failed
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      maxRetriesPerRequest: null,
    },
    concurrency: 5,
  },
);
CacheWorker.on("completed", (job) => {
  console.log(`Cache invalidation for key ${job.id} completed`);
});

CacheWorker.on("failed", (job, err) => {
  console.error(`Cache invalidation for key ${job!.id} failed:`, err);
});

const invalidateCache = async (pattern: string) => {
  const stream = redis.scanStream({
    match: pattern,
    count: 100,
  });
  const pipeline = redis.pipeline();
  let totalKeys = 0;

  stream.on("data", (keys: string[]) => {
    if (keys.length > 0) {
      keys.forEach((key) => {
        pipeline.del(key);
        totalKeys++;
      });
    }
  });

  //wrap stream event in a promise 
  await new Promise<void>((resolve,reject)=>{
    stream.on("end", async () => {
    try {
      if (totalKeys > 0) {
        await pipeline.exec();
        console.log(`Invalidated ${totalKeys} keys for pattern ${pattern}`);
      }
      resolve()
    } catch (execError) {
      reject(execError)
    }
    
  });
  })
  
  stream.on("error", (error) => {
      
  })
};
