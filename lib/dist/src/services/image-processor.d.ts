import { ImageProcessingOptions } from '../models/image-processing-options';
interface ProcessorConfig {
    maxFileSizeMB?: number;
    maxImageCount?: number;
    supportedFormats?: string[];
}
export declare class ImageProcessor {
    private defaultEnhancementOptions;
    private defaultCompressionOptions;
    private config;
    constructor(config?: ProcessorConfig);
    processImages(files: File[], options?: ImageProcessingOptions): Promise<{
        blob: Blob;
        dataUrl: string;
        width: number;
        height: number;
    }[]>;
    processImage(file: File, options?: ImageProcessingOptions): Promise<{
        blob: Blob;
        dataUrl: string;
        width: number;
        height: number;
    }>;
    private processImageWithEnhancement;
    private processImageWithCompression;
    private processImageWithBoth;
    private processDirect;
    private validateFiles;
    private enhanceImage;
    private compressImage;
    private analyzeImage;
    private adjustBrightness;
    private adjustContrast;
    private adjustSaturation;
    private applySharpeningFilter;
    private applyTextureEffect;
    private generatePronouncedTexturePattern;
    private getCompressionQuality;
}
export {};
