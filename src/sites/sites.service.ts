import { Injectable } from '@nestjs/common';
import { CreateSiteDTO } from './sites.dto';
import { Site } from './sites.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SitesService {
  constructor(@InjectModel('Sites') private siteModel: Model<Site>) {}

  async insertSite(data: CreateSiteDTO) {
    const newSite = new this.siteModel(data);
    return await newSite.save();
  }

  async getAllSites() {
    return await this.siteModel.find().exec();
  }

  async getSiteById(id: string) {
    return await this.siteModel.findById(id).exec();
  }

  async updateSite(id: string, data: CreateSiteDTO) {
    return await this.siteModel.findByIdAndUpdate(id, data);
  }
}
