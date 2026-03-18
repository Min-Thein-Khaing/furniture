import { Request,Response ,NextFunction} from "express";
import { getNumberId } from "../../services/auth.js";
import { checkUserNotExist } from "../../utils/userExist.js";
import { ResponseError } from "../../utils/responseError.js";
import { getPost, postWithRelation } from "../../services/post.js";

interface CustomerRequest extends Request {
    userId?: string;
}
export const getPostOne = async(req:CustomerRequest,res:Response,next:NextFunction)=>{
    try {
    
        const postId = Number(req.params.id);
    
        const userId = req.userId!;
        const user = await getNumberId(Number(userId));
    
        checkUserNotExist(user);
    
        const oldPost = await postWithRelation(postId);
    
        if (!oldPost) {
          throw new ResponseError("Post not found",404,"post_not_found");
        }
    
        // if (user!.id !== oldPost.authorId) {
        //   return res.status(403).json({
        //     message: "You are not authorized to show this post",
        //   });
        // }
       
    
        return res.status(200).json({
          message: "Show Post Successfully",
          data: oldPost
        });
    
      } catch (error) {
        next(error);
      }
    
}
export const getPostByPagination = async(req:Request,res:Response,next:NextFunction)=>{
    
}

export const getPostInfinitePagination = async(req:Request,res:Response,next:NextFunction)=>{
    
}