import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function createMulterOptions(destination: string) {
  return {
    storage: diskStorage({
      destination,
      filename: (_req, file, cb) => {
        const filename = `${uuidv4()}${extname(file.originalname)}`;
        cb(null, filename);
      },
    }),
    fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
      if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
        return cb(
          new BadRequestException(
            'Only jpeg, png, webp images and PDF documents are allowed',
          ),
          false,
        );
      }
      cb(null, true);
    },
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
  };
}

export const productMulterOptions = createMulterOptions('uploads/products');
export const categoryMulterOptions = createMulterOptions('uploads/categories');
export const medicalDocumentMulterOptions = createMulterOptions('uploads/medical-documents');
export const routineMulterOptions = createMulterOptions('uploads/routines');

// Recording upload config - larger file size limit for long consultations, audio MIME types
const RECORDING_MIMETYPES = ['audio/webm', 'audio/ogg', 'audio/wav', 'audio/mpeg', 'audio/mp4'];
const MAX_RECORDING_SIZE = 200 * 1024 * 1024; // 200MB

export const recordingMulterOptions = {
    storage: diskStorage({
        destination: 'uploads/recordings',
        filename: (_req, file, cb) => {
            const filename = `${uuidv4()}${extname(file.originalname)}`;
            cb(null, filename);
        },
    }),
    fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
        if (!RECORDING_MIMETYPES.includes(file.mimetype)) {
            return cb(
                new BadRequestException('Only audio files (webm, ogg, wav, mp3, mp4) are allowed'),
                false,
            );
        }
        cb(null, true);
    },
    limits: {
        fileSize: MAX_RECORDING_SIZE,
    },
};
