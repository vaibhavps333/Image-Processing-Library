export declare const ErrorConstants: {
    InvalidFile: string;
    MaxFileSizeNotDefined: string;
    SupportedFormatsNotDefined: string;
    FileSizeExceedsLimit: (maxFileSizeMB: number, fileSizeMB: number) => string;
    UnsupportedFileFormat: (fileType: string, supportedFormats: string[]) => string;
    MaxImageCountNotDefined: string;
    ExceedMaxImageCount: (maxImageCount: number, fileCount: number) => string;
    InvalidProcessingMode: string;
};
