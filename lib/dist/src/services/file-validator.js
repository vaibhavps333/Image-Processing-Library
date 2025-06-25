"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileValidator = void 0;
const error_constants_1 = require("./error-constants");
const fileValidator = {
    validateFile(file, maxFileSizeMB, supportedFormats) {
        if (!file) {
            throw new Error(error_constants_1.ErrorConstants.InvalidFile);
        }
        if (maxFileSizeMB === undefined || maxFileSizeMB === null) {
            throw new Error(error_constants_1.ErrorConstants.MaxFileSizeNotDefined);
        }
        if (!Array.isArray(supportedFormats) || supportedFormats.length === 0) {
            throw new Error(error_constants_1.ErrorConstants.SupportedFormatsNotDefined);
        }
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxFileSizeMB) {
            throw new Error(error_constants_1.ErrorConstants.FileSizeExceedsLimit(maxFileSizeMB, fileSizeMB));
        }
        if (!supportedFormats.includes(file.type)) {
            throw new Error(error_constants_1.ErrorConstants.UnsupportedFileFormat(file.type, supportedFormats));
        }
    }
};
exports.fileValidator = fileValidator;
