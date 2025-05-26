// utils/fileUpload.ts
import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import fs from 'fs'
import config from '../config/config'
import path from 'path'
import { optimizeImage } from './optimizeImage'
import { OPTIMIZE_IMAGE } from '../types/media.types'

// Cloudinary config
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET
})

const uploadDir = './../uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Multer config
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir)
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix + ext)
  }
})

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed!'))
    }
  }
})

export const uploadToCloudinary = async (filePath: string, type: OPTIMIZE_IMAGE = 'post'): Promise<string> => {
  const optimizedPath = await optimizeImage(filePath, type)
  const result = await cloudinary.uploader.upload(optimizedPath, {
    folder: 'portfolio-images'
  })
  // Delete file after upload
  fs.unlinkSync(filePath)
  fs.unlinkSync(optimizedPath)
  return result.secure_url
}
