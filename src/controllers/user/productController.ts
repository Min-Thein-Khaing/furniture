import { NextFunction, Response, Request } from "express";
import {
  getCategoryList,
  getProductsList,
  getProductWithRelation,
  getTypeList,
  ProductPropsType,
} from "../../services/product.js";
import { ResponseError } from "../../utils/responseError.js";
import { getOrSetCache } from "../../utils/cache.js";
import { validationFunction } from "../../utils/validationFunction.js";
import { getNumberId } from "../../services/auth.js";
import { checkUserNotExist } from "../../utils/userExist.js";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}
export const getOneProduct = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = Number(req.params.id);
    if (isNaN(productId)) {
      throw new ResponseError("Invalid product ID", 400, "invalid_product_id");
    }

    const cacheKey = `products:${JSON.stringify(productId)}`;
    const product = await getOrSetCache(cacheKey, async () => {
      return await getProductWithRelation(productId);
    });
    if (!product) {
      throw new ResponseError("Product not found", 404, "product_not_found");
    }
    return res.status(200).json({
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

//saya phone nyo idea
// export const getProductsByPagination = async (req: CustomRequest, res: Response, next: NextFunction) => {
//     // ✅ validation
//     if (validationFunction(req, res, next)) return;

//     const userId = req.userId!;
//     const user = await getNumberId(Number(userId));
//     checkUserNotExist(user);

//     // ✅ query params
//     const lastCursor = req.query.cursor ? Number(req.query.cursor) : undefined;

//     const limit = req.query.limit ? Number(req.query.limit) : 5;

//     const category = req.query.category;
//     const type = req.query.type;

//     let categoryList: number[] = [];
//     let typeList: number[] = [];
//     if (category) {
//         categoryList = category.toString().split(",").map((c) => Number(c)).filter(c => c > 0);
//     }
//     if (type) {
//         typeList = type.toString().split(",").map((t) => Number(t)).filter(t => t > 0);
//     }
//     const andConditions: any[] = [];

//     if (categoryList.length > 0) {
//         andConditions.push({
//             categoryId: {
//                 in: categoryList,
//             },
//         });
//     }

//     if (typeList.length > 0) {
//         andConditions.push({
//             typeId: {
//                 in: typeList,
//             },
//         });
//     }

//     const where = {
//         AND: andConditions,
//     };

//     // ✅ prisma option
//     const option = {
//         where,
//         take: limit + 1,
//         skip: lastCursor ? 1 : 0,
//         cursor: lastCursor ? { id: lastCursor } : undefined,
//         select: {
//             id: true,
//             name: true,
//             description: true,
//             price: true,
//             rating: true,
//             inventory: true,
//             images: {
//                 select: {
//                     path: true,
//                 },
//                 take:1
//             },
//             user: {
//                 select: {
//                     firstName: true,
//                     lastName: true,
//                 }
//             },
//         },
//         orderBy: { id: "desc" },
//     };
//     const cacheKey = `products:${JSON.stringify(req.query)}`;
//     const products: ProductPropsType[] = await getOrSetCache(cacheKey, async () => {
//         return await getProducts(option);
//     });
//     // ✅ check next page
//     const hasNextPage = products.length > limit;
//     if (hasNextPage) {
//         products.pop(); // remove extra item
//     }
//     // ✅ format response
//     const formattedProducts = products.map((product) => ({
//         ...product,
//         images: product.images.map((image) => ({
//             path: `http://localhost:${process.env.PORT}/uploads/optimize/${image.path.replace(/\.[^/.]+$/, "").replace(/\\/g, "/")}.webp`,
//         })),
//         user: product.user
//             ? {
//                 firstName: product.user.firstName,
//                 lastName: product.user.lastName,
//                 fullName: `${product.user.firstName} ${product.user.lastName}`,
//             }
//             : null,
//     }));
//     const nextCursor =
//         hasNextPage && products.length > 0 ? products[products.length - 1].id : null;
//     return res.status(200).json({
//         message: "Products fetched successfully",
//         data: formattedProducts,
//         pagination: {
//             hasNextPage,
//             nextCursor: hasNextPage ? products[products.length - 1].id : null,
//         },
//     });
// }

//chat gpt idea
export const getProductsByPagination = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // ✅ validation
    if (validationFunction(req, res, next)) return;

    const userId = req.userId!;
    const user = await getNumberId(Number(userId));
    checkUserNotExist(user);

    // ✅ query params
    const lastCursor = req.query.cursor ? Number(req.query.cursor) : undefined;

    const limit = req.query.limit ? Number(req.query.limit) : 5;

    const category = req.query.category;
    const type = req.query.type;
    const search = req.query.q?.toString() || "";

    // ✅ convert query → array
    let categoryList: number[] = [];
    let typeList: number[] = [];

    if (category) {
      categoryList = category
        .toString()
        .split(",")
        .map((c) => Number(c))
        .filter((c) => c > 0);
    }

    if (type) {
      typeList = type
        .toString()
        .split(",")
        .map((t) => Number(t))
        .filter((t) => t > 0);
    }

    // ✅ dynamic filters
    const andConditions: any[] = [];

    if (categoryList.length > 0) {
      andConditions.push({
        categoryId: { in: categoryList },
      });
    }

    if (typeList.length > 0) {
      andConditions.push({
        typeId: { in: typeList },
      });
    }

    // ✅ search
    if (search) {
      andConditions.push({
        name: {
          contains: search,
          mode: "insensitive",
        },
      });
    }

    // ✅ final where
    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    // ✅ prisma option
    const option = {
      where,
      take: limit + 1,
      skip: lastCursor ? 1 : 0,
      cursor: lastCursor ? { id: lastCursor } : undefined,
      orderBy: { id: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        rating: true,
        inventory: true,
        status:true,
        images: {
          select: {
            path: true,
          },
          take: 1,
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        type: {
          select: {
            name: true,
          },
        },
      },
    };

    // ✅ cache key (stable)
    const cacheKey = `products:${JSON.stringify({
      cursor: lastCursor,
      limit,
      category: categoryList,
      type: typeList,
      search,
    })}`;

    // ✅ fetch data
    const products = await getOrSetCache(cacheKey, async () => {
      return await getProductsList(option);
    });

    // ✅ pagination logic
    const hasNextPage = products.length > limit;

    if (hasNextPage) {
      products.pop();
    }

    const nextCursor =
      hasNextPage && products.length > 0
        ? products[products.length - 1].id
        : null;

    // ✅ base url
    const baseUrl =
      process.env.BASE_URL || `http://localhost:${process.env.PORT}`;

    // ✅ format response (FIXED 🔥)
    const formattedProducts = products.map((product: any) => ({
      ...product,
      images: product.images
        .map((image: any) => {
          const path = image?.path;
          if (!path) return null;

          return {
            path: `${baseUrl}/uploads/optimize/${path
              .replace(/\.[^/.]+$/, "")
              .replace(/\\/g, "/")}.webp`,
          };
        })
        .filter(Boolean),
      user: product.user
        ? {
            firstName: product.user.firstName,
            lastName: product.user.lastName,
            fullName: `${product.user.firstName} ${product.user.lastName}`,
          }
        : null,
      category: product.category?.name || null,
      type: product.type?.name || null,
    }));

    return res.status(200).json({
      message: "Products fetched successfully",
      data: formattedProducts,

      hasNextPage,
      nextCursor,
      previousCursor: lastCursor || null,
    });
  } catch (error) {
    next(error);
  }
};
//filter
export const getProductsByCategoryType = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (validationFunction(req, res, next)) return;

    const userId = req.userId!;
    const user = await getNumberId(Number(userId));
    checkUserNotExist(user);

    const categories = await getCategoryList();
    const types = await getTypeList();

    return res.status(200).json({
      message: "Category and Type show successfully",
      data: {
        categories: categories,
        types: types,
      },
    });
  } catch (error) {
    next(error);
  }
};
