import { body } from "express-validator";
import sanitizeHtml from "sanitize-html";

export const createPostValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 3, max: 150 }).withMessage("Title must be 3-150 characters")
    .escape(),

  body("content")
    .trim()
    .notEmpty().withMessage("Content is required")
    .isLength({ min: 10 }).withMessage("Content must be at least 10 characters")
    .customSanitizer(value => sanitizeHtml(value)).notEmpty(),

  body("body")
    .trim()
    .notEmpty().withMessage("Body is required")
    .isLength({ min: 10 }).withMessage("Body must be at least 10 characters")
    .customSanitizer(value => sanitizeHtml(value)).notEmpty(),
  body("categoryName")
    .trim()
    .notEmpty().withMessage("Category name is required")
    .escape(),

  body("typeName")
    .trim()
    .notEmpty().withMessage("Type name is required")
    .escape(),

  body("tags")
    .optional({ checkFalsy: true })
    .customSanitizer(value => {
      if (typeof value === 'string') {
        return value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
      return Array.isArray(value) ? value : [];
    }),
];


export const updatePostValidator = [
  body("title")
    .optional()
    .trim()
    .notEmpty().withMessage("Title cannot be empty if provided")
    .isLength({ min: 3, max: 150 }).withMessage("Title must be 3-150 characters")
    .escape(),

  body("content")
    .optional()
    .trim()
    .notEmpty().withMessage("Content cannot be empty if provided")
    .isLength({ min: 10 }).withMessage("Content must be at least 10 characters")
    .customSanitizer(value => sanitizeHtml(value)).notEmpty(),

  body("body")
    .optional()
    .trim()
    .notEmpty().withMessage("Body cannot be empty if provided")
    .isLength({ min: 10 }).withMessage("Body must be at least 10 characters")
    .customSanitizer(value => sanitizeHtml(value)).notEmpty(),


  body("categoryName")
    .optional()
    .trim()
    .notEmpty().withMessage("Category name cannot be empty if provided")
  ,

  body("typeName")
    .optional()
    .trim()
    .notEmpty().withMessage("Type name cannot be empty if provided")
  ,

  body("tags")
    .optional({ checkFalsy: true })
    .customSanitizer(value => {
      if (typeof value === 'string') {
        return value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
      return Array.isArray(value) ? value : [];
    }),
];
