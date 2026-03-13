import express from "express";
import {
  uploadProfileMultiple,
  changeLanguageController,
  uploadProfileOptimize,
  // getPhoto,
  testPermission,
  uploadProfile
} from "../../../controllers/user/profileController.js";
import { proxy } from "../../../middlewares/proxy.js";
import upload, { uploadMemory } from "../../../middlewares/uploadFile.js";
import { getPost, getPostByPagination } from "../../../controllers/user/postController.js";


const router = express.Router();

router.post("/change-language", changeLanguageController);
router.get("/test-permission", proxy, testPermission);
router.get("/posts",proxy,getPostByPagination)
router.get("/post/:id",proxy,getPost)

router.patch("/profile/upload",proxy,upload.single('avatar'),uploadProfile)
router.patch("/profile/upload/optimize",proxy,upload.single('avatar'),uploadProfileOptimize)
router.patch("/profile/upload/multiple",proxy,upload.array('avatar',5),uploadProfileMultiple)

//testing
// router.get("/testing-image",getPhoto)

export default router;
