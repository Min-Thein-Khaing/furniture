import { NextFunction, Response, Request } from "express";
import { getSettingStatus } from "../services/setting.js";
import { ResponseError } from "../utils/responseError.js";

export const maintenance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const whitelistIp = ["127.0.0.1"];
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (whitelistIp.includes(ip as string)) {
    return next();
  } else {
    const setting = await getSettingStatus("maintenance");
    if (setting?.value === "true") {
      throw new ResponseError(
        "This server is currently under maintenance.Please try again later",
        503,
        "Error_maintenance",
      );
    }
    next();
  }
};
