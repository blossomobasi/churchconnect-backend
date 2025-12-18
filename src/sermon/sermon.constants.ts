import { MEGABYTE } from "src/common/utils/file-size";

export const SUPPORTED_FILE_TYPES_FOR_SERMON_AUDIO = ["audio/mpeg", "audio/wav", "audio/mp3"];
export const SUPPORTED_FILE_TYPES_FOR_SERMON_VIDEO = ["video/mp4", "video/mpeg", "video/quicktime"];
export const SUPPORTED_FILE_TYPES_FOR_SERMON_THUMBNAIL = ["image/jpeg", "image/png", "image/jpg"];

export const MAX_FILE_SIZE_FOR_SERMON_AUDIO = 20 * MEGABYTE; // 20 MB
export const MAX_FILE_SIZE_FOR_SERMON_VIDEO = 50 * MEGABYTE; // 50 MB
export const MAX_FILE_SIZE_FOR_SERMON_THUMBNAIL = 5 * MEGABYTE; // 5 MB
