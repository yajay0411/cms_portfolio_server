import sharp from 'sharp'
// import fs from 'fs';
import path from 'path'

// Define presets
const IMAGE_PRESETS: Record<string, { width: number; height?: number; quality: number; format: 'jpeg' | 'webp' }> = {
  profile: { width: 300, height: 300, quality: 80, format: 'jpeg' },
  post: { width: 1080, quality: 75, format: 'jpeg' },
  story: { width: 1280, quality: 85, format: 'jpeg' }
}

/**
 * Optimizes an image based on type and returns the new path
 */
export const optimizeImage = async (originalPath: string, type: 'profile' | 'post' | 'story' = 'post'): Promise<string> => {
  try {
    const { width, height, quality, format } = IMAGE_PRESETS[type]

    const ext = format === 'jpeg' ? '.jpg' : '.webp'
    const optimizedPath = path.join(path.dirname(originalPath), `${path.basename(originalPath, path.extname(originalPath))}-optimized${ext}`)

    const transformer = sharp(originalPath).resize({ width, height }).toFormat(format, { quality })
    await transformer.toFile(optimizedPath)
    return optimizedPath
  } catch (error) {
    console.log(error)
    return ''
  }
}
