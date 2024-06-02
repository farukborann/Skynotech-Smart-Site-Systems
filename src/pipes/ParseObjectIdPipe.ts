import mongoose from 'mongoose';

import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * Defines the pipe for MongoDB ObjectID validation and transformation
 */
@Injectable()
export class ParseObjectIdPipe
  implements PipeTransform<any, mongoose.Types.ObjectId>
{
  /**
   * Validates and transforms a value to a MongoDB ObjectID
   *
   * @remarks
   * Throws a ArgumentException if the validation fails
   *
   * @param value - The value to validate and transform
   * @returns The MongoDB ObjectID
   */
  public transform(value: any): mongoose.Types.ObjectId {
    try {
      const transformedObjectId: mongoose.Types.ObjectId =
        mongoose.Types.ObjectId.createFromHexString(value);
      return transformedObjectId;
    } catch (error) {
      throw new BadRequestException('Validation failed (ObjectId is expected)');
    }
  }
}
