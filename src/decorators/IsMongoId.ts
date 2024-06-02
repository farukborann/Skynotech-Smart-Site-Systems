import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, ValidationOptions } from 'class-validator';
import mongoose from 'mongoose';

import { applyDecorators, BadRequestException } from '@nestjs/common';

export function ToMongoObjectId({ value, key }): mongoose.Types.ObjectId {
  if (mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(value);
  } else {
    throw new BadRequestException(`${key} is not a valid MongoId`);
  }
}

export function IsMongoId(validationOptions?: ValidationOptions) {
  return applyDecorators(
    IsNotEmpty(validationOptions),
    Type(() => mongoose.Types.ObjectId),
    Transform(ToMongoObjectId, { toClassOnly: true }),
  );
}
