import { NextFunction, Response,Request } from "express";
import { getProductWithRelation } from "../../services/product.js";
import { ResponseError } from "../../utils/responseError.js";
import { getOrSetCache } from "../../utils/cache.js";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}
export const getOneProduct =async(req:CustomRequest,res:Response,next:NextFunction) => {
    try {
        const productId = Number(req.params.id);
        if(isNaN(productId)){
            throw new ResponseError("Invalid product ID", 400, "invalid_product_id");
        }
        
        
        const cacheKey = `products:${JSON.stringify(productId)}`;
        const product = await getOrSetCache(cacheKey, async () => {
              return await getProductWithRelation(productId);
            });
        if(!product){
            throw new ResponseError("Product not found", 404, "product_not_found");
        }
        return res.status(200).json({
            message: "Product fetched successfully",
            data: product,
        });
    } catch (error) {
        next(error)
    }
}
    
