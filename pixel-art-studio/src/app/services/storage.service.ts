import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import {
  BucketName,
  GetSignedUrlResult,
  UploadAvatarInput,
  UploadResult,
  UploadThumbnailInput,
} from '../types/storage/upload';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly AVATAR_BUCKET: BucketName = 'PixelArtStudio-user-avatar';
  private readonly THUMBNAIL_BUCKET: BucketName = 'PixelArtStudio-project-thumbnails';

  constructor(private supabaseService: SupabaseService) {}

  async uploadAvatar(uploadData: UploadAvatarInput): Promise<UploadResult> {
    const path = `${uploadData.userId}/avatar.webp`;
    return this.uploadFile(this.AVATAR_BUCKET, path, uploadData.file, 'image/webp');
  }

  async uploadProjectThumbnail(uploadData: UploadThumbnailInput): Promise<UploadResult> {
    const path = `${uploadData.userId}/${uploadData.projectId}.webp`;
    return this.uploadFile(this.THUMBNAIL_BUCKET, path, uploadData.blob, 'image/webp');
  }

  async getSignedUrl(
    bucket: BucketName,
    path: string,
    expiresIn = 3600,
  ): Promise<GetSignedUrlResult> {
    const { data, error } = await this.supabaseService.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      return {
        success: false,
        error: new Error(error.message),
      };
    }

    return {
      success: true,
      url: data.signedUrl,
    };
  }

  async removeObject(bucket: BucketName, path: string): Promise<boolean> {
    const { error } = await this.supabaseService.supabase.storage.from(bucket).remove([path]);
    return !error;
  }

  private async uploadFile(
    bucket: BucketName,
    path: string,
    file: Blob,
    contentType?: string,
  ): Promise<UploadResult> {
    const { data, error } = await this.supabaseService.supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
        contentType,
      });

    if (error) {
      return {
        success: false,
        bucket,
        path,
        error: new Error(error.message),
      };
    }

    return {
      success: true,
      bucket,
      path,
      fullPath: data.path,
    };
  }
}
