import { EnhancementOptions } from './enhancement-options';
import { CompressionOptions } from './compression-options';
import { ImageProcessingMode } from '../enums/image-processing-mode';

export interface ImageProcessingOptions {
  mode?: ImageProcessingMode;
  enhancementOptions?: EnhancementOptions;
  compressionOptions?: CompressionOptions;
  maxFileSizeMB?: number;
  maxImageCount?: number;
  supportedFormats?: string[];
}
