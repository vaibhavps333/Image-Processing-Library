interface FileValidator {
    validateFile(file: File, maxFileSizeMB: number, supportedFormats: string[]): void;
}
declare const fileValidator: FileValidator;
export { fileValidator };
