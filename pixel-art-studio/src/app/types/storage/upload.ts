export type BucketName = 'PixelArtStudio-user-avatar' | 'PixelArtStudio-project-thumbnails';

export type UploadThumbnailInput = {
  userId: string;
  projectId: string;
  blob: Blob;
};

export type UploadAvatarInput = {
  userId: string;
  file: File;
};

export interface UploadSuccess {
  success: true;
  bucket: BucketName;
  path: string;
  fullPath: string;
}

export interface UploadFailure {
  success: false;
  bucket: BucketName;
  path?: string;
  error: Error;
}

export type UploadResult = UploadSuccess | UploadFailure;

export interface SignedUrlResult {
  success: true;
  url: string;
}
export interface SignedUrlFailure {
  success: false;
  error: Error;
}
export type GetSignedUrlResult = SignedUrlResult | SignedUrlFailure;
