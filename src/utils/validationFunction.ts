import { NextFunction, Request,Response } from "express";
import { validationResult } from "express-validator";

export const validationFunction = (req:Request,res:Response,next:NextFunction) =>{
    const result = validationResult(req);

  if (!result.isEmpty()) {
    const formattedErrors: Record<string, string[]> = {};

    result.array({ onlyFirstError: true }).forEach((err: any) => {
      const field = err.param ?? err.path; // TS safe
      if (!formattedErrors[field]) {
        formattedErrors[field] = [];
      }
      formattedErrors[field].push(err.msg);
    });

    return res.status(422).json({
      message: "The given data was invalid.",
      errors: formattedErrors,
    });
  }
  return false;
}