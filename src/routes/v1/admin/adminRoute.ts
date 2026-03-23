import express from "express";
import { indexUser } from "../../../controllers/admin/userController.js";
import { authorize } from "../../../middlewares/authorize.js";
import { setMaintenance } from "../../../controllers/admin/maintenanceController.js";
import { maintenanceValidator } from "../../../validators/registerValidator.js";
import upload from "../../../middlewares/uploadFile.js";
import { createPost, deletePost, updatePost } from "../../../controllers/admin/postController.js";
import { createPostValidator, updatePostValidator } from "../../../validators/postValidator.js";
import { createProduct, updateProduct } from "../../../controllers/admin/productController.js";
import { createProductValidator,updateProductValidator } from "../../../validators/productValidator.js";

const router = express.Router();

router.get("/user", indexUser);
router.post(
  "/maintenance",
  maintenanceValidator,
  setMaintenance,
);

//create post
router.post(
  "/post",
  upload.single('image'),
  createPostValidator,
  createPost
);

// Update Post
router.patch(
  "/post/:id",
  upload.single('image'), 
  updatePostValidator,    
  updatePost
);
//delete Post
router.delete("/post/:id", deletePost)

//create product
router.post(
  "/product",
  upload.array('images',5),
  createProductValidator,
  createProduct
);
//update product
router.patch(
  "/product/:id",
  upload.array('images',5), 
  updateProductValidator,    
  updateProduct
);


export default router;
