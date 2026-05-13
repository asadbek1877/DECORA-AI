import { Request, Response, NextFunction } from 'express';
import { upload } from './upload';

/**
 * Middleware that uses multer only for multipart/form-data requests
 * For JSON requests, passes through to the next middleware
 */
export const optionalUpload = (req: Request, res: Response, next: NextFunction) => {
  const contentType = req.get('content-type') || '';
  
  // Only use multer if the request is multipart/form-data
  if (contentType.includes('multipart/form-data')) {
    return upload.single('image')(req, res, next);
  }
  
  // For JSON or other content types, skip multer and continue
  next();
};
