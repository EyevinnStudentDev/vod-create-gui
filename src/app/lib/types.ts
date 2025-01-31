export interface FileObject {
  bucket: string;
  key: string | undefined;
  size: number;
  lastModified: Date | undefined;
}

export interface FileObjectTranscode {
  bucket: string;
  name: string | undefined;
  size: number;
  lastModified: Date | undefined;
}

export interface FileUploadRequest {
  originalFileName: string;
  fileSize: number;
}

export interface PresignedUrlResponse {
  fileNameInBucket: string;
  originalFileName: string;
  fileSize: number;
  url: string;
}

export interface PresignedUrlData {
  fileNameInBucket: string;
  url: string;
}
