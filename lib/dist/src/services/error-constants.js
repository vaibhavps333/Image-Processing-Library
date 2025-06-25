"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorConstants = void 0;
exports.ErrorConstants = {
    InvalidFile: 'Invalid file',
    MaxFileSizeNotDefined: 'maxFileSizeMB is not defined',
    SupportedFormatsNotDefined: 'supportedFormats is not defined or empty',
    FileSizeExceedsLimit: (maxFileSizeMB, fileSizeMB) => `File size exceeds the maximum limit of ${maxFileSizeMB} MB. File size: ${fileSizeMB.toFixed(2)} MB`,
    UnsupportedFileFormat: (fileType, supportedFormats) => `Unsupported file format: ${fileType}. Supported formats: ${supportedFormats.join(', ')}`,
    MaxImageCountNotDefined: 'maxImageCount is not defined',
    ExceedMaxImageCount: (maxImageCount, fileCount) => `Cannot process more than ${maxImageCount} images at a time. Files provided: ${fileCount}`,
    InvalidProcessingMode: 'Invalid processing mode'
};
