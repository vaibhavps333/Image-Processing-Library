export const ErrorConstants = {
    InvalidFile: 'Invalid file',
    MaxFileSizeNotDefined: 'maxFileSizeMB is not defined',
    SupportedFormatsNotDefined: 'supportedFormats is not defined or empty',
    FileSizeExceedsLimit: (maxFileSizeMB: number, fileSizeMB: number) => 
      `File size exceeds the maximum limit of ${maxFileSizeMB} MB. File size: ${fileSizeMB.toFixed(2)} MB`,
    UnsupportedFileFormat: (fileType: string, supportedFormats: string[]) => 
      `Unsupported file format: ${fileType}. Supported formats: ${supportedFormats.join(', ')}`,
    MaxImageCountNotDefined: 'maxImageCount is not defined',
    ExceedMaxImageCount: (maxImageCount: number, fileCount: number) => 
      `Cannot process more than ${maxImageCount} images at a time. Files provided: ${fileCount}`,
    InvalidProcessingMode: 'Invalid processing mode'
  };

  