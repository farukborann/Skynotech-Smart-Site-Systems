import { Transform, Type } from 'class-transformer';
import mongoose from 'mongoose';

import { applyDecorators, BadRequestException } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';

export function ToMongoObjectId({ value, key }): mongoose.Types.ObjectId {
  if (mongoose.Types.ObjectId.isValid(value)) {
    return mongoose.Types.ObjectId.createFromHexString(value);
  } else {
    throw new BadRequestException(`${key} is not a valid MongoId`);
  }
}

export function IsMongoId() {
  return applyDecorators(
    IsNotEmpty(),
    Type(() => mongoose.Types.ObjectId),
    Transform(ToMongoObjectId, { toClassOnly: true }),
  );
}

export function IsMongoIdArray() {
  return applyDecorators(
    IsNotEmpty(),
    Type(() => mongoose.Types.ObjectId),
    Transform(
      (params) => {
        if (!Array.isArray(params.value)) {
          throw new BadRequestException(`${params.key} is not an array`);
        }

        return params.value.map((value) =>
          ToMongoObjectId({ value, key: `One of ${params.key}'s elements` }),
        );
      },
      { toClassOnly: true },
    ),
  );
}
