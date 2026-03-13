import { Request, Response, NextFunction } from "express";
import { ResponseError } from "../utils/responseError.js";
import jwt from "jsonwebtoken";
import { errorCode } from "../config/errorCode.js";
import { getNumberId, updateUser } from "../services/auth.js";
interface CustomRequest extends Request {
  userId?: number;
}
export const proxy = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  //from mobile platform call api
  // 1. is using teacher set up and then in postman add x-platform : mobile and authentication:dfsdfsljiofguf67
  // const platform = req.headers["x-platform"];
  // if (platform === "mobile") {
  //   const accessTokenMobile = req.headers.authorization?.split(" ")[1];
  //   console.log("Request from Mobile", accessTokenMobile);
  // } else {
  //   console.log("Request from Web");
  // }

  //2. is refactor code in chatgpt
  // let accessToken: string | undefined;
  //   accessToken =
  // req.headers.authorization?.startsWith("Bearer ")
  //   ? req.headers.authorization.split(" ")[1]
  //   : undefined;
  // console.log(
  //   accessToken ? "Request from Mobile" : "Request from Web",
  //   accessToken ?? "",
  // );

  //for web
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw new ResponseError("Unauthorized User", 401, "Unauthorized");
  }
  const generateNewToken = async () => {
    let decode;
    try {
      decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as {
        id: number;
        phone: string;
      };
    } catch {
      throw new ResponseError("RefreshToken is invalid", 401, "Unauthorized");
    }
    // if(isNaN(decode.id)){
    //   throw new ResponseError("user is not found", 401, "Unauthorized");
    // }
    const user = await getNumberId(decode.id);
    if (!user) {
      throw new ResponseError(
        "You are not an authenticated user.",
        400,
        "Unauthorized",
      );
    }
    if (user.phone !== decode.phone) {
      throw new ResponseError(
        "You are not an authenticated user.",
        400,
        "Unauthorized",
      );
    }
    if (user.randToken !== refreshToken) {
      throw new ResponseError(
        "You are not an authenticated user.",
        400,
        "Unauthorized",
      );
    }

    const newAccessToken = jwt.sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" },
    );

    const newRefreshToken = jwt.sign(
      { id: user.id, phone: user.phone },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "30d" },
    );

    await updateUser(
      {
        randToken: newRefreshToken,
        updatedAt: new Date(),
      },
      user.id,
    );
    res
      .cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    req.userId = user.id;
    next();
  };

  if (!accessToken) {
    await generateNewToken();
  } else {
    let decode;
    try {
      decode = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as {
        id: number;
      };
      req.userId = decode.id;
      next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        await generateNewToken();
      } else {
        throw new ResponseError("AccessToken is invalid", 401, "Error_Attack");
      }
    }
  }
};
