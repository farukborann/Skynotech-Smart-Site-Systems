import * as fs from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import sharp from 'sharp';
import { UsersService } from 'src/users/users.service';
import { v4 as uuidv4 } from 'uuid';

import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

const ensureDirExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const imageDir = join(__dirname, '../../public/img/uploads/');

ensureDirExists(imageDir);

const imageStorage = diskStorage({
  destination: imageDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = extname(file.originalname);
    cb(null, `${uuidv4()}-${uniqueSuffix}${ext}`);
  },
});

@Controller('api/v1/upload/')
export class UploadController {
  constructor(private readonly usersService: UsersService) {}

  @Post('pp')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: imageStorage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5mb
      },
      fileFilter: async (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }

        file.buffer = await sharp(file.buffer).toFormat('webp').toBuffer();
        file.originalname = file.originalname.replace(/\.\w+$/, '.webp');

        cb(null, true);
      },
    }),
  )
  async uploadPP(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const filePath = `${process.env.BASE_URL}/img/uploads/${file.filename.replace(/\.\w+$/, '.webp')}`;

    await this.usersService.updateUser(
      req.user.id,
      { profilePhoto: filePath },
      req.user,
    );

    return {
      fileUrl: filePath,
    };
  }
}
