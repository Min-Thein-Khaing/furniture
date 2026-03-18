import { Request, Response, NextFunction } from "express";
import { validationFunction } from "../../utils/validationFunction.js";
import { getNumberId } from "../../services/auth.js";
import { checkFileExist } from "../../utils/check.js";
import { checkUserNotExist } from "../../utils/userExist.js";

import {
  createOnePost,
  getPost,
  PostPropsType,
  updateOnePost,
  postDelete
} from "../../services/post.js";

import {
  deleteFile,
  deletePostImages,
  optimizeImage,
} from "../../utils/fileHelper.js";
import { ResponseError } from "../../utils/responseError.js";


interface CustomRequest extends Request {
  userId?: number;
}

const cleanupUpload = async (req: CustomRequest) => {
  if (req.file) {
    await deleteFile(req.file.path);
  }
};

export const createPost = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (validationFunction(req, res, next)) {
    await cleanupUpload(req);
    return;
  }

  try {
    const { title, content, body, categoryName, typeName, tags } = req.body;

    const userId = req.userId!;
    const user = await getNumberId(userId);

    const image = req.file;

    checkUserNotExist(user);
    checkFileExist(image);
    if (image && image.size === 0) {
      console.error("CRITICAL: Uploaded file is 0 bytes!");
      await cleanupUpload(req);
      return res.status(422).json({
        message: "Uploaded image is empty. Please check your request.",
      });
    }

    if (image) {
      await optimizeImage(image);
    }

    const postObject: PostPropsType = {
      title,
      content,
      body,
      image: image?.filename ?? "",
      authorId: user!.id,
      categoryName,
      typeName,
      tags: tags || [],
    };

    const data = await createOnePost(postObject);

    return res.status(200).json({
      message: "Create Post Successfully",
      data,
    });
  } catch (error) {
    await cleanupUpload(req);
    next(error);
  }
};

export const updatePost = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (validationFunction(req, res, next)) {
    await cleanupUpload(req);
    return;
  }

  try {
    const { title, content, body, categoryName, typeName, tags } =
      req.body;
    const { id } = req.params;
    const postId = Number(id);

    const userId = req.userId!;
    const user = await getNumberId(userId);
    
    const newImage = req.file;

    checkUserNotExist(user);

    const oldPost: any = await getPost(+postId);
    if(user!.id !== oldPost!.authorId){
      await cleanupUpload(req);
      return res.status(403).json({
        message: "You are not authorized to update this post",
      });
    }
    if (!oldPost) {
      await cleanupUpload(req);

      return res.status(404).json({
        message: "Post not found",
      });
    }

    let finalImageName = oldPost.image;

    if (newImage) {
      finalImageName = newImage.filename;

      await deletePostImages(oldPost.image);

      await optimizeImage(newImage);
    }

    const postObject: PostPropsType = {
      title: title || oldPost.title,
      content: content || oldPost.content,
      body: body || oldPost.body,
      image: finalImageName || oldPost.image,
      authorId: user!.id || oldPost.authorId,
      categoryName: categoryName || oldPost.category?.name,
      typeName: typeName || oldPost.type?.name,
      tags: tags || (oldPost.tags ? oldPost.tags.map((t: any) => t.name) : []),
    };

    const data = await updateOnePost(postId, postObject);

    return res.status(200).json({
      message: "Update Post Successfully",
      data,
    });
  } catch (error) {
    await cleanupUpload(req);
    next(error);
  }
};

export const deletePost = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {

    const postId = Number(req.params.id);

    const userId = req.userId!;
    const user = await getNumberId(userId);

    checkUserNotExist(user);

    const oldPost:any = await getPost(postId);

    if (!oldPost) {
      throw new ResponseError("Post not found",404,"post_not_found");
    }

    await deletePostImages(oldPost.image);

    if (user!.id !== oldPost.authorId) {
      return res.status(403).json({
        message: "You are not authorized to delete this post",
      });
    }

    await postDelete(postId);

    return res.status(200).json({
      message: "Delete Post Successfully",
    });

  } catch (error) {
    next(error);
  }
};