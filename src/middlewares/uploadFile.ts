import multer, { FileFilterCallback } from "multer";
import { Request, Response, NextFunction } from "express";



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, 'uploads/images')

    
    // const type = file.mimetype.split('/')[0]
    // if(type === 'image') {
    //   cb(null, 'uploads/images')
    // } else {
    //   cb(null, 'uploads/files')
    // }
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split('/')[1]
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '.' + ext)
  }
})

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/webp') {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 1024 * 1024 * 2 //2 MB
    }//5 MB us good but 10 MB is we need to do optimization
})
export const uploadMemory = multer({
  storage:multer.memoryStorage(),
  fileFilter:fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10
  }
})

export default upload;