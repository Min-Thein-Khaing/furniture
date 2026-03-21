import { Request, Response, NextFunction } from "express";
import { getNumberId } from "../../services/auth.js";
import { checkUserNotExist } from "../../utils/userExist.js";
import { ResponseError } from "../../utils/responseError.js";
import {
  getPost,
  getPostsByPaginationWithOffset,
  postWithRelation,
} from "../../services/post.js";
import { query } from "express-validator";
import { validationFunction } from "../../utils/validationFunction.js";
import { prisma } from "../../lib/prisma.js";

interface CustomerRequest extends Request {
  userId?: number;
}
export const getPostOne = async (
  req: CustomerRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const postId = Number(req.params.id);

    const userId = req.userId!;
    const user = await getNumberId(Number(userId));

    checkUserNotExist(user);

    const oldPost = await postWithRelation(postId);

    if (!oldPost) {
      throw new ResponseError("Post not found", 404, "post_not_found");
    }

    // if (user!.id !== oldPost.authorId) {
    //   return res.status(403).json({
    //     message: "You are not authorized to show this post",
    //   });
    // }

    return res.status(200).json({
      message: "Show Post Successfully",
      data: oldPost,
    });
  } catch (error) {
    next(error);
  }
};
//laravel pagination style
export const getPostByPagination = async (
  req: CustomerRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (validationFunction(req, res, next)) return;
 const userId = req.userId!;
    const user = await getNumberId(Number(userId));

    checkUserNotExist(user);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 5);
    const skip = (page - 1) * limit;

    const totalPosts = await prisma.post.count(); 

    const option = {
      skip,
      take: limit, 
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        updatedAt: true,
        user: {
          select: { firstName: true, lastName: true },
        },
        tags: true,
        category: true,
        type: true,
      },
      orderBy: { id: "desc" }
    };

    const posts = await getPostsByPaginationWithOffset(option);

   
    const formattedData = posts.map((post: any) => ({
      ...post,
      user: post.user ? {
        ...post.user,
        fullName: `${post.user.firstName} ${post.user.lastName}`
      } : null
    }));

    const lastPage = Math.ceil(totalPosts / limit);
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;

    return res.status(200).json({
      data: formattedData,
      links: {
        first: `${baseUrl}?page=1&limit=${limit}&`,
        last: `${baseUrl}?page=${lastPage}&limit=${limit}`,
        prev: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
        next: page < lastPage ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
      },
      meta: {
        current_page: page,
        from: skip + 1,
        last_page: lastPage,
        path: baseUrl,
        per_page: limit,
        to: skip + posts.length,
        total: totalPosts,
      }
    });

  } catch (error) {
    next(error);
  }
};

// production
// export const getPostByPagination = async (
//   req: CustomerRequest,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     // 1. Validation Catch
//     if (validationFunction(req, res, next)) return;

//     // 2. Parse Query Params (Sanitize numbers)
//     const page = Math.max(1, parseInt(req.query.page as string) || 1);
//     const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 5)); // Limit ကို max 100 ထက် ပိုမပေးပါနဲ့
//     const skip = (page - 1) * limit;

//     // 3. Database Queries (Parallel execution for speed)
//     // total count နဲ့ data ကို တစ်ပြိုင်တည်း ခေါ်တာက ပိုမြန်ပါတယ်
//     const [posts, totalPosts] = await Promise.all([
//       getPostsByPaginationWithOffset({
//         skip,
//         take: limit,
//         select: {
//           id: true,
//           title: true,
//           content: true,
//           image: true,
//           updatedAt: true,
//           user: {
//             select: { firstName: true, lastName: true },
//           },
//           tags: true,
//           category: true,
//           type: true,
//         },
//         orderBy: { updatedAt: "desc" },
//       }),
//       prisma.post.count(),
//     ]);

//     // 4. Data Transformation (Laravel Resource Style)
//     const formattedData = posts.map((post: any) => ({
//       id: post.id,
//       title: post.title,
//       content: post.content,
//       // Image path optimization
//       image: post.image 
//         ? `${process.env.APP_URL}/uploads/optimize/${post.image.split('.')[0]}.webp` 
//         : null,
//       updatedAt: post.updatedAt.toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       }),
//       user: post.user ? {
//         fullName: `${post.user.firstName} ${post.user.lastName}`,
//       } : null,
//       tags: post.tags,
//       category: post.category,
//       type: post.type,
//     }));

//     // 5. Build Laravel-style Response
//     const lastPage = Math.ceil(totalPosts / limit);
//     const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}`;

//     return res.status(200).json({
//       data: formattedData,
//       links: {
//         first: `${baseUrl}?page=1&limit=${limit}`,
//         last: `${baseUrl}?page=${lastPage}&limit=${limit}`,
//         prev: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
//         next: page < lastPage ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
//       },
//       meta: {
//         current_page: page,
//         from: skip + 1,
//         last_page: lastPage,
//         path: baseUrl,
//         per_page: limit,
//         to: skip + posts.length,
//         total: totalPosts,
//       },
//     });

//   } catch (error) {
//     // 6. Global Error Handling
//     next(error); 
//   }
// };

export const getPostInfinitePagination = [ query("cursor").isInt({gt:0}).withMessage("Cursor must be an integer").optional(),query("limit").isInt({gt:4}).withMessage("Limit must be an integer").optional(),async (
  req: CustomerRequest,
  res: Response,
  next: NextFunction,
) => {
  if(validationFunction(req, res, next)) return;
   const userId = req.userId!;
    const user = await getNumberId(Number(userId));

    checkUserNotExist(user);
  const lastCursor =Number(req.query.cursor);
  const limit = req.query.limit ? Number(req.query.limit) : 5;

  const option = {
    take: limit + 1,
    skip : lastCursor ? 1 : 0,
    cursor: lastCursor ? { id: lastCursor } : undefined,
    select: {
        id: true,
        title: true,
        content: true,
        image: true,
        updatedAt: true,
        user: {
          select: { firstName: true, lastName: true },
        },
        tags: true,
        category: true,
        type: true,
      },
      orderBy: { id: "asc" }
  }
  const posts = await getPostsByPaginationWithOffset(option);

  const formattedData = posts.map((post: any) => ({
    ...post,
    image: post.image ? `${process.env.APP_URL}/uploads/optimize/${post.image.split('.')[0]}.webp` : null,
    user: post.user ? {
      fullName: `${post.user.firstName} ${post.user.lastName}`,
    } : null,
  }))

  const nextCursor = posts.length > limit ;
  if(nextCursor){
    posts.pop();
  }
const newCursor = posts.length > 0 ? posts[posts.length - 1].id : null;
 
  return res.status(200).json({
    data: formattedData,
    nextCursor,
    newCursor
  });
}];
