import { body } from "express-validator";

export const createProductValidator = [
  body("name")
    .notEmpty()
    .withMessage("Product name is required")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ max: 255 })
    .withMessage("Name cannot exceed 255 characters")
    .trim(),

  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isString()
    .withMessage("Description must be a string"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    // Decimal (10, 2) အတွက် စစ်ဆေးခြင်း
    .isFloat({ min: 0.01 })
    .withMessage("Price must be a number greater than 0"),

  body("discount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount cannot be negative"),

  body("rating")
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage("Rating must be between 0 and 5"),

  body("inventory")
    .notEmpty()
    .withMessage("Inventory is required")
    .isInt({ min: 0 })
    .withMessage("Inventory cannot be negative"),
  // body("images")
  //   .optional({ checkFalsy: true })
  //   .isArray()
  //   .withMessage("Images must be an array"),
  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE", "ARCHIVED"])
    .withMessage("Invalid status"),

  body("typeName").notEmpty().withMessage("Type Name is required"),

  body("categoryName").notEmpty().withMessage("Category Name is required"),
  body("tags")
    .optional({ checkFalsy: true })
    .customSanitizer((value) => {
      if (typeof value === "string") {
        return value
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
      }
      return Array.isArray(value) ? value : [];
    }),
];

export const updateProductValidator = [
  body("name")
    .notEmpty()
    .withMessage("Product name is required")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ max: 255 })
    .withMessage("Name cannot exceed 255 characters")
    .trim(),

  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isString()
    .withMessage("Description must be a string"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    // Decimal (10, 2) အတွက် စစ်ဆေးခြင်း
    .isFloat({ min: 0.01 })
    .withMessage("Price must be a number greater than 0"),

  body("discount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount cannot be negative"),

  body("rating")
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage("Rating must be between 0 and 5"),

  body("inventory")
    .notEmpty()
    .withMessage("Inventory is required")
    .isInt({ min: 0 })
    .withMessage("Inventory cannot be negative"),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE", "ARCHIVED"])
    .withMessage("Invalid status"),

  body("typeName").notEmpty().withMessage("Type Name is required"),

  body("categoryName").notEmpty().withMessage("Category Name is required"),
  body("images")
    .optional({ checkFalsy: true })
    .isArray()
    .withMessage("Images must be an array"),
  body("tags")
    .optional({ checkFalsy: true })
    .customSanitizer((value) => {
      if (typeof value === "string") {
        return value
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
      }
      return Array.isArray(value) ? value : [];
    }),
];
