import express from "express";
import { indexUser } from "../../../controllers/admin/userController.js";
import { authorize } from "../../../middlewares/authorize.js";
import { setMaintenance } from "../../../controllers/admin/maintenanceController.js";
import { maintenanceValidator } from "../../../validators/registerValidator.js";
import upload from "../../../middlewares/uploadFile.js";
import { createPost, deletePost, updatePost } from "../../../controllers/admin/postController.js";
import { createPostValidator, updatePostValidator } from "../../../validators/postValidator.js";

const router = express.Router();

router.get("/user", indexUser);
router.post(
  "/maintenance",
  maintenanceValidator,
  setMaintenance,
);


router.post(
  "/post",
  upload.single('image'),
  createPostValidator,
  createPost
);

// Update Post
router.patch(
  "/post/:id",
  upload.single('image'), // ၁။ အရင်ဖတ်
  updatePostValidator,    // ၂။ ပြီးမှ စစ်
  updatePost
);
router.delete("/post/:id", deletePost)
export default router;
