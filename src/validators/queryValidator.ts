import { query } from "express-validator";

export const changeLanguage = [
  query("lng")
    .trim()
    .notEmpty()
    .withMessage("Language is required")
    .isIn(["mm", "en"])
    .withMessage("Invalid language"),
];

export const pagination = [
  query("page","Page must be an integer")
    .isInt({gt:0})
    .withMessage("Page must be an integer")
    .optional(), 
  query("limit","Limit must be an integer")
    .isInt({gt:0})
    .withMessage("Limit must be an integer")
    .optional(),
];