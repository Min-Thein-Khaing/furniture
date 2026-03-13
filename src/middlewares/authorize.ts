import { Request, RequestHandler } from "express";
import { errorCode } from "../config/errorCode.js";
import { ResponseError } from "../utils/responseError.js";
import { getNumberId } from "../services/auth.js";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

export const authorize = (
  permission: boolean,
  ...roles: string[]
): RequestHandler => {
  return async (req, res, next) => {
    try {
      const customReq = req as CustomRequest;

      const userId = customReq.userId;
      if (!userId) {
        throw new ResponseError("Unauthorized", 401, errorCode.unauthenticated);
      }

      const user = await getNumberId(userId);

      if (!user) {
        throw new ResponseError("User does not exist", 400, "user_not_found");
      }

      const result = roles.includes(user.role);

      if (permission && !result) {
        throw new ResponseError("This is not allowed User", 403, errorCode.unauthenticated);
      }

      if (!permission && result) {
        throw new ResponseError("This is not allowed User", 403, errorCode.unauthenticated);
      }

      customReq.user = user;

      next();
    } catch (error) {
      next(error);
    }
  };
};
