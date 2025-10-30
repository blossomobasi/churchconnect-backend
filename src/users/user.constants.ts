import { MEGABYTE } from "src/common/utils/file-size";

export const SUPPORTED_FILE_TYPES_FOR_USER_IMAGE = ["image/jpeg", "image/png", "image/jpg", "image/heic", "image/heif", "image/heif-sequence"];
export const SUPPORTED_USER_IMAGE_FILE_SIZE = 30 * MEGABYTE; // 50 mb;

export const SUPPORTED_FILE_SIZE_FOR_USER_RESUME = 100 * MEGABYTE;
export const SUPPORTED_FILE_TYPES_FOR_USER_RESUME = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
