import { Request, Response, NextFunction } from "express";
import { validationFunction } from "../../utils/validationFunction.js";
import { get } from "node:http";
import { getNumberId } from "../../services/auth.js";
import { checkFileExist } from "../../utils/check.js";
import { checkUserNotExist } from "../../utils/userExist.js";
import { ImageQueue } from "../../jobs/queues/imageQueue.js";
import { createOnePost, PostPropsType } from "../../services/post.js";
import fs from "fs";

interface CustomRequest extends Request {
  userId?: number;
}
export const createPost = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  if (validationFunction(req, res, next)) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file after validation failure:", err);
      });
    }
    return;
  }
  try {
    let { title, content, body, categoryName, typeName, tags } = req.body;
    const userId = req.userId!;
    const user = await getNumberId(userId);
    const image = req.file;
    checkUserNotExist(user);
    checkFileExist(image);

const splitFilePath = req.file?.filename.split(".")[0];  
    await ImageQueue.add(
      "optimizeImage",
      {
        filePath: image?.path,
        fileName: splitFilePath+".webp",
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
    )
    const postObject:PostPropsType = {
      title,
      content,
      body,
      image: req.file!.filename,
      authorId: user!.id,
      categoryName,
      typeName,
      tags: tags || []
    }
    const data = await createOnePost(postObject)
    
    return res.status(200).json({
      message: "Create Post Successfully",
      data
    });

  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file after execution failure:", err);
      });
    }
    next(error);
  }
};

export const updatePost = (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  res.send("updatePost");
};

export const deletePost = (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  res.send("deletePost");
};
