export interface ImageProcessingOptions {
    mode?: 'enhancement' | 'compression' | 'both' | 'direct';
    enhancementOptions?: EnhancementOptions;
    compressionOptions?: CompressionOptions;
    maxFileSizeMB?: number;
    maxImageCount?: number;
    supportedFormats?: string[];
}
export interface EnhancementOptions {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    texture?: boolean;
    sharpening?: boolean;
}
export interface CompressionOptions {
    level?: 'high' | 'normal' | 'low' | 'highest';
    maxDimension?: number;
}
export interface ProcessorConfig {
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
  private analyzeImage;
  private adjustBrightness;
  private adjustContrast;
  private adjustSaturation;
  private applyTextureEnhancement;
  private applyAdvancedSharpeningFilter;
  private compressImage;
}
