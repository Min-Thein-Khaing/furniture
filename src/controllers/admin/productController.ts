import { Request, NextFunction, Response } from "express";
import { deleteFile, optimizeImages } from "../../utils/filesHelper.js";
import { validationFunction } from "../../utils/validationFunction.js";
import { ResponseError } from "../../utils/responseError.js";
import { createProducts, ProductPropsType } from "../../services/product.js";
import { Product } from "../../generated/prisma/client.js";
import { CacheQueue } from "../../jobs/queues/cacheQueue.js";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}
const cleanupUpload = async (req: CustomRequest) => {
  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files) {
      await deleteFile(file.path);
    }
  } else if (req.files) {
    for (const key in req.files as { [fieldname: string]: Express.Multer.File[] }) {
      for (const file of (req.files as { [fieldname: string]: Express.Multer.File[] })[key]) {
        await deleteFile(file.path);
      }
    }
  } else if (req.file) {
    await deleteFile(req.file.path);
  }
};
export const createProduct = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  if (validationFunction(req, res, next)) {
    await cleanupUpload(req);
    return;
  }

  try {
    const {
      name, description, price, discount, 
      rating, inventory, status, 
      categoryName, typeName, tags 
    } = req.body;

    const files = req.files as Express.Multer.File[] | undefined;
    const user = req.user;


    //check files
    // if (!files || files.length === 0) {
    //   await cleanupUpload(req);
    //   return res.status(422).json({
    //     message: "Uploaded image is empty. Please check your request.",
    //   });
    // }



    // ၁။ ပုံပါလာရင်သာ Optimize လုပ်မယ်
    if (files && files.length > 0) {
      await optimizeImages(files);
    }

    // ၃။ Database Service ကို ခေါ်ခြင်း
    const productObject: ProductPropsType = {
      name,
      description,
      price: Number(price),
      discount: Number(discount || 0),
      rating: Number(rating || 0),
      inventory: Number(inventory),
      status,
      categoryName,
      typeName,
      tags: tags || [],
      // files မပါရင် Array အလွတ် [] လေး ထည့်ပေးမယ်
      images: files && files.length > 0 ? files.map((file) => file.filename) : [],
      authorId: user.id,
    };

    const data = await createProducts(productObject);

    // ၄။ Cache ရှင်းလင်းခြင်း
    await CacheQueue.add("invalidate-product-cache", {
      pattern: `products:*`,
    });

    // ၅။ အောင်မြင်ကြောင်း Response ပြန်ခြင်း
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data,
    });

  } catch (error) {
    // Error တက်ရင် တင်ထားတဲ့ ပုံတွေကို ပြန်ဖျက်ပေးရမယ်
    await cleanupUpload(req);
    next(error); 
  }
};
export const updateProduct = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {};
export const deleteProduct = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {};
