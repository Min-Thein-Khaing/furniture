import { NextFunction, Request, Response } from "express";
import { changeLanguage } from "../../validators/queryValidator.js";
import { validationFunction } from "../../utils/validationFunction.js";
import { createUser, getNumberId, updateUser } from "../../services/auth.js";
import { authorize } from "../../utils/authorize.js";
import { check } from "express-validator";
import { checkFileExist } from "../../utils/check.js";
import { ResponseError } from "../../utils/responseError.js";
import { unlink, access } from "node:fs/promises";
import path from "path";
import sharp from "sharp";
import { error } from "node:console";
import { argThresholdOpts } from "moment";
import { ImageQueue } from "../../jobs/queues/imageQueue.js";

interface CustomRequest extends Request {
  userId?: number;
}
export const changeLanguageController = [
  ...changeLanguage,
  (req: CustomRequest, res: Response, next: NextFunction) => {
    if (validationFunction(req, res, next)) return;
    const { lng } = req.query;
    res.cookie("i18next", lng);
    res.status(200).json({ message: req.t("changeLan", { lang: lng }) });
  },
];

export const testPermission = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const info: any = {
    title: "min ga lar par",
  };
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const user = await getNumberId(userId);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const can = authorize(true, user.role, "ADMIN");
  if (can) {
    info.content = "you are allow to read this post";
  }
  res.status(200).json(info);
};

export const uploadProfile = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.userId!;
  const user = await getNumberId(userId);
  if (!user) {
    throw new ResponseError("User does not exist", 400, "user_not_found");
  }
  const image = req.file;
  checkFileExist(image);
  const fileName = image!.filename;
  if (user!.image) {
    try {
      const filePath = path.join(
        process.cwd(),
        "uploads",
        "images",
        user!.image,
      );
      await access(filePath);
      await unlink(filePath);
    } catch (error) {
      console.log(error);
    }
  }

  const userData = {
    image: fileName,
  };
  const result = await updateUser(userData, user.id);
  return res.status(200).json({ message: result });
};

export const uploadProfileMultiple = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId!;
    const user = await getNumberId(userId);

    if (!user) {
      throw new ResponseError("User does not exist", 400, "user_not_found");
    }

    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      throw new ResponseError("Images are required", 400, "image_required");
    }
    const fileName = files.map((file) => file.filename);
    if (user.image) {
      try {
        for (const oldImage of user.image) {
          const filePath = path.join(
            process.cwd(),
            "uploads",
            "images",
            oldImage,
          );
          await access(filePath);
          await unlink(filePath);
        }
      } catch (error) {
        console.log("File not found or already deleted");
      }
    }
    const userData = {
      image: fileName,
    };
    await updateUser(userData, user.id);
    return res.status(200).json({
      message: "Upload success",
    });
  } catch (error) {
    console.log("REAL ERROR 👉", error);
    next(error);
  }
};
export const uploadProfileOptimize = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.userId!;
  const user = await getNumberId(userId);
  if (!user) {
    throw new ResponseError("User does not exist", 400, "user_not_found");
  }
  const image = req.file as Express.Multer.File;
  checkFileExist(image);

  const splitFileName = req.file!.filename.split(".")[0];

  const job = await ImageQueue.add(
    "optimizeImage",
    {
      filePath: image.path,
      fileName: splitFileName + ".webp",
      width: 300,
      height: 300,
      quality: 50,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    },
  );
  if (user.image) {
    const originalFilePath = path.join(
      process.cwd(),
      "uploads",
      "images",
      user.image,
    );
    const optimizeFilePath = path.join(
      process.cwd(),
      "uploads",
      "optimize",
      splitFileName + ".webp",
    );
    try {
      await unlink(originalFilePath);
      await unlink(optimizeFilePath);
    } catch (error) {
      console.log("File not found or already deleted");
    }
  }
  const userData = {
    image: req.file!.filename,
  };
  await updateUser(userData, user.id);
  return res.status(200).json({
    message: "Upload Optimize success",
    data: splitFileName + ".webp",
    jobId: job.id,
  });
};

// export const uploadProfileOptimizeMultiple = async (
//   req: CustomRequest,
//   res: Response,
//   next: NextFunction,
// ) => {

//   const userId = req.userId!;
//   const user = await getNumberId(userId);

//   if (!user) {
//     throw new ResponseError("User does not exist", 400, "user_not_found");
//   }

//   const images = req.files as Express.Multer.File[];

//   if (!images || images.length === 0) {
//     throw new ResponseError("Image is required", 400, "image_required");
//   }

//   // delete old images
//   if (user.images && user.images.length > 0) {

//     for (const oldImage of user.images) {

//       const originalFilePath = path.join(
//         process.cwd(),
//         "uploads",
//         "images",
//         oldImage
//       );

//       const optimizeFilePath = path.join(
//         process.cwd(),
//         "uploads",
//         "optimize",
//         oldImage.split(".")[0] + ".webp"
//       );

//       try {
//         await unlink(originalFilePath);
//         await unlink(optimizeFilePath);
//       } catch (error) {
//         console.log("File not found or already deleted");
//       }

//     }

//   }

//   const results:any[] = [];

//   for (const image of images) {

//     const splitFileName = image.filename.split(".")[0];

//     const job = await ImageQueue.add(
//       "optimizeImage",
//       {
//         filePath: image.path,
//         fileName: splitFileName + ".webp",
//         width: 300,
//         height: 300,
//         quality: 50,
//       },
//       {
//         attempts: 3,
//         backoff: {
//           type: "exponential",
//           delay: 1000,
//         },
//       },
//     );

//     results.push({
//       file: splitFileName + ".webp",
//       jobId: job.id,
//     });

//   }

//   return res.status(200).json({
//     message: "Upload Optimize success",
//     data: results,
//   });

// };
//testing for me
// export const getPhoto = async(req:Request,res:Response,next:NextFunction)=>{

//   const filePath = path.join(process.cwd(), "uploads", "images", "1771470831582-925295651-t1.png");
//   res.sendFile(filePath,error=>{console.log(error)});
// }
