import fs from "fs";
import path from "node:path";
import { promisify } from "util";
import { ImageQueue } from "../jobs/queues/imageQueue.js";

const unlinkAsync = promisify(fs.unlink);

/**
 * ၁။ ဖိုင်တစ်ခုချင်းစီကို ဖျက်ပေးသည့် Function
 */
export const deleteFile = async (filePath?: string) => {
  if (!filePath) return;

  try {
    if (fs.existsSync(filePath)) {
      await unlinkAsync(filePath);
    }
  } catch (error) {
    console.error(`File delete error at ${filePath}:`, error);
  }
};

/**
 * ၂။ ပုံအများကြီး (Array of Strings) ကို Original ရော Optimize ရော လိုက်ဖျက်ပေးသည့် Function
 */
export const deletePostImages = async (imageNames: string[]) => {
  if (!imageNames || imageNames.length === 0) return;

  // ပုံအားလုံးကို တစ်ပြိုင်တည်း (Parallel) ဖျက်ရန် Promise.all သုံးသည်
  const deletePromises = imageNames.map(async (imageName) => {
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

    // နှစ်မျိုးလုံးကို ဖျက်မည်
    await deleteFile(originalPath);
    await deleteFile(optimizePath);
  });

  await Promise.all(deletePromises);
};

/**
 * ၃။ ပုံအများကြီး (Multer Files Array) ကို Queue ထဲသို့ တစ်ပုံချင်းစီ Job အနေဖြင့် ထည့်ပေးသည့် Function
 */
export const optimizeImages = async (files: Express.Multer.File[]) => {
  if (!files || files.length === 0) return;

  const optimizePromises = files.map(async (file) => {
    const splitFileName = file.filename.split(".")[0];

    // BullMQ Queue ထဲသို့ Job ထည့်ခြင်း
    return ImageQueue.add(
      "optimizeImage",
      {
        filePath: file.path,
        fileName: splitFileName + ".webp",
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
        // အောင်မြင်ရင် memory ထဲက ချက်ချင်းဖျက်၊ ရှုံးရင် ၁ စက္ကန့်နေရင်ဖျက်
        removeOnComplete: true,
        removeOnFail: 1000,
      }
    );
  });

  // အားလုံး Queue ထဲရောက်သွားပြီဆိုမှ အလုပ်ပြီးမည်
  return await Promise.all(optimizePromises);
};