import { query } from "express-validator";

export const changeLanguage = [
  query("lng")
    .trim()
    .notEmpty()
    .withMessage("Language is required")
    .isIn(["mm", "en"])
    .withMessage("Invalid language"),
];