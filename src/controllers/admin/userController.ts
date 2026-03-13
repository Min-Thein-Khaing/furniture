import { NextFunction, Request, Response } from "express";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}
const indexUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;
  res.status(200).json({ message: req.t("welcome"), data: user.role });
};


export { indexUser };
