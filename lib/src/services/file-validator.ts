import { ErrorConstants } from './error-constants';

interface FileValidator {
  validateFile(file: File, maxFileSizeMB: number, supportedFormats: string[]): void;
}

const fileValidator: FileValidator = {
  validateFile(file, maxFileSizeMB, supportedFormats) {
    if (!file) {
      throw new Error(ErrorConstants.InvalidFile);
    }

    if (maxFileSizeMB === undefined || maxFileSizeMB === null) {
      throw new Error(ErrorConstants.MaxFileSizeNotDefined);
    }

    if (!Array.isArray(supportedFormats) || supportedFormats.length === 0) {
      throw new Error(ErrorConstants.SupportedFormatsNotDefined);
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSizeMB) {
      throw new Error(ErrorConstants.FileSizeExceedsLimit(maxFileSizeMB, fileSizeMB));
    }

    if (!supportedFormats.includes(file.type)) {
      throw new Error(ErrorConstants.UnsupportedFileFormat(file.type, supportedFormats));
    }
  }
};

export { fileValidator };
