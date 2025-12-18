import { BadRequestException } from "@nestjs/common";

export interface FileValidationOptions {
    allowedTypes: string[];
    maxSize: number;
    label: string;
}

export function validateFile(file: Express.Multer.File, options: FileValidationOptions): void {
    const { allowedTypes, maxSize, label } = options;

    if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException(`${label} must be one of: ${allowedTypes.join(", ")}`);
    }

    if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        throw new BadRequestException(`${label} size must be less than ${maxSizeMB}MB`);
    }
}
