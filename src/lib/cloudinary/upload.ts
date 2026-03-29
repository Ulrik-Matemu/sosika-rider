import { MAX_UPLOAD_SIZE_BYTES } from '../../constants/rider';
import type { CloudinaryAsset } from '../../types/rider';

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  asset_id: string;
  version: number;
  bytes: number;
  format: string;
  width?: number;
  height?: number;
  original_filename: string;
  resource_type: string;
}

export interface UploadOptions {
  folder: string;
  tags?: string[];
  context?: Record<string, string>;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
  retries?: number;
}

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_PRESET_NAME;

function buildAsset(response: CloudinaryUploadResponse): CloudinaryAsset {
  return {
    secureUrl: response.secure_url,
    publicId: response.public_id,
    assetId: response.asset_id,
    version: response.version,
    bytes: response.bytes,
    format: response.format,
    width: response.width,
    height: response.height,
    originalFilename: response.original_filename,
    uploadedAt: new Date().toISOString(),
    resourceType: response.resource_type,
  };
}

function uploadOnce(file: File, options: UploadOptions): Promise<CloudinaryAsset> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const formData = new FormData();

    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', options.folder);

    if (options.tags?.length) {
      formData.append('tags', options.tags.join(','));
    }

    if (options.context) {
      const context = Object.entries(options.context)
        .map(([key, value]) => `${key}=${value}`)
        .join('|');
      formData.append('context', context);
    }

    request.open('POST', url);

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable || !options.onProgress) {
        return;
      }

      options.onProgress(Math.round((event.loaded / event.total) * 100));
    };

    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error('Upload failed. Please try again.'));
        return;
      }

      const response = JSON.parse(request.responseText) as CloudinaryUploadResponse;
      resolve(buildAsset(response));
    };

    request.onerror = () => reject(new Error('Network error during upload.'));
    request.onabort = () => reject(new Error('Upload was cancelled.'));

    if (options.signal) {
      options.signal.addEventListener('abort', () => request.abort(), { once: true });
    }

    request.send(formData);
  });
}

export async function uploadImageWithRetry(file: File, options: UploadOptions): Promise<CloudinaryAsset> {
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary environment variables are missing.');
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error('The selected file is too large.');
  }

  const retries = options.retries ?? 2;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await uploadOnce(file, options);
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        break;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Upload failed.');
}
