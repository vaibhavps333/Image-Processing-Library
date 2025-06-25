import { EnhancementOptions } from '../models/enhancement-options';
import { CompressionOptions } from '../models/compression-options';
import { ImageProcessingOptions } from '../models/image-processing-options';
import { ImageProcessingMode } from '../enums/image-processing-mode';
import { CompressionLevel } from '../enums/compression-level';
import { ErrorConstants } from './error-constants';
import { fileValidator } from './file-validator';

interface ProcessorConfig {
  maxFileSizeMB?: number;
  maxImageCount?: number;
  supportedFormats?: string[];
}

export class ImageProcessor {
  private defaultEnhancementOptions: EnhancementOptions = {
    brightness: -10,
    contrast: 45,
    saturation: 1,
    texture: true,
    sharpening: true
  };

  private defaultCompressionOptions: CompressionOptions = {
    level: CompressionLevel.Normal
  };

  private config: ProcessorConfig;

  constructor(config: ProcessorConfig = {}) {
    this.config = {
      maxFileSizeMB: config.maxFileSizeMB || 5,
      maxImageCount: config.maxImageCount || 1,
      supportedFormats: config.supportedFormats || [
        'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 
        'image/webp', 'image/tiff', 'image/x-icon', 
        'image/svg+xml', 'image/heif', 'image/heic','image/jfif'
      ]
    };
  }

  async processImages(files: File[], options: ImageProcessingOptions = {}): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }[]> {
    this.validateFiles(files, options);

    const promises = files.map(file => this.processImage(file, options));
    return Promise.all(promises);
  }

  async processImage(file: File, options: ImageProcessingOptions = {}): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
    const mode = options.mode || ImageProcessingMode.Compression;

    switch (mode) {
      case ImageProcessingMode.Enhancement:
        return this.processImageWithEnhancement(file, options.enhancementOptions);
      case ImageProcessingMode.Compression:
        return this.processImageWithCompression(file, options.compressionOptions);
      case ImageProcessingMode.Both:
        return this.processImageWithBoth(file, options);
      case ImageProcessingMode.Direct:
        return this.processDirect(file);
      default:
        throw new Error(ErrorConstants.InvalidProcessingMode);
    }
  }

  private async processImageWithEnhancement(file: File, enhancementOptions?: EnhancementOptions): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
    const options = {
      ...this.defaultEnhancementOptions,
      ...enhancementOptions
    };
    return this.enhanceImage(file, options);
  }

  private async processImageWithCompression(file: File, compressionOptions?: CompressionOptions): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
    const options = {
      ...this.defaultCompressionOptions,
      ...compressionOptions
    };
    return this.compressImage(file, options);
  }

  private async processImageWithBoth(file: File, options: ImageProcessingOptions): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
    const enhancedImageBlob = await this.processImageWithEnhancement(file, options.enhancementOptions).then(result => result.blob);
    const enhancedImageFile = new File([enhancedImageBlob], file.name, { type: file.type });

    return this.processImageWithCompression(enhancedImageFile, options.compressionOptions);
  }

  private async processDirect(file: File): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        resolve({
          blob: file,
          dataUrl: event.target.result,
          width: 0,
          height: 0
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private validateFiles(files: File[], options: ImageProcessingOptions): void {
    const mergedOptions = {
      ...this.config,
      ...options
    };

    const { maxFileSizeMB, supportedFormats, maxImageCount } = mergedOptions;

    if (maxImageCount === undefined || maxImageCount === null) {
      throw new Error(ErrorConstants.MaxImageCountNotDefined);
    }

    if (files.length > maxImageCount) {
      throw new Error(ErrorConstants.ExceedMaxImageCount(maxImageCount, files.length));
    }

    files.forEach(file => {
      try {
        fileValidator.validateFile(file, maxFileSizeMB!, supportedFormats!);
      } catch (error: any) {
        throw error;
      }
    });
  }

  private async enhanceImage(file: File, options: EnhancementOptions): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const data = imageData.data;

          const enhancementSettings = {
            ...this.defaultEnhancementOptions,
            ...options
          };

          const { brightness } = this.analyzeImage(data);
          const brightnessAdjustment = enhancementSettings.brightness ?? (brightness < 100 ? 10 : -70);

          if (enhancementSettings.brightness !== undefined) {
            this.adjustBrightness(data, brightnessAdjustment);
          }

          if (enhancementSettings.contrast !== undefined) {
            this.adjustContrast(data, enhancementSettings.contrast);
          }

          if (enhancementSettings.saturation !== undefined) {
            this.adjustSaturation(data, enhancementSettings.saturation);
          }

          if (enhancementSettings.sharpening) {
            this.applySharpeningFilter(imageData, ctx);
          }

          if (enhancementSettings.texture) {
            this.applyTextureEffect(ctx, img.width, img.height);
          }

          ctx.putImageData(imageData, 0, 0);

          canvas.toBlob(blob => {
            resolve({
              blob: blob!,
              dataUrl: canvas.toDataURL(file.type),
              width: img.width,
              height: img.height
            });
          }, file.type);
        };
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async compressImage(file: File, options: CompressionOptions): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          let { width, height } = img;

          if (options.maxDimension) {
            const maxDimension = options.maxDimension;
            if (width > height) {
              if (width > maxDimension) {
                height *= maxDimension / width;
                width = maxDimension;
              }
            } else {
              if (height > maxDimension) {
                width *= maxDimension / height;
                height = maxDimension;
              }
            }
          }
          
          const compressionQuality = this.getCompressionQuality(options.level);


          canvas.width = width *compressionQuality;
          canvas.height = height * compressionQuality;
          ctx.drawImage(img, 0, 0, width, height);


          canvas.toBlob(blob => {
            resolve({
              blob: blob!,
              dataUrl: canvas.toDataURL(file.type, compressionQuality),
              width,
              height
            });
          }, file.type, compressionQuality);
        };
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private analyzeImage(data: Uint8ClampedArray) {
    let brightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      brightness += (r + g + b) / 3;
    }
    brightness = brightness / (data.length / 4);
    return { brightness };
  }

  private adjustBrightness(data: Uint8ClampedArray, adjustment: number) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] += adjustment;
      data[i + 1] += adjustment;
      data[i + 2] += adjustment;
    }
  }

  private adjustContrast(data: Uint8ClampedArray, contrast: number) {
    const factor = (170 * (contrast + 255)) / (255 * (259 - contrast));
    for (let i = 0; i < data.length; i += 4) {
      data[i] = factor * (data[i] - 128) + 128;
      data[i + 1] = factor * (data[i + 1] - 128) + 128;
      data[i + 2] = factor * (data[i + 2] - 128) + 128;
    }
  }

  private adjustSaturation(data: Uint8ClampedArray, saturation: number) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const avg = (r + g + b) / 3;
      data[i] += saturation * (r - avg);
      data[i + 1] += saturation * (g - avg);
      data[i + 2] += saturation * (b - avg);
    }
  }

  private applySharpeningFilter(imageData: ImageData, ctx: CanvasRenderingContext2D) {
    const kernel = [
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
    ];

    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const copy = new Uint8ClampedArray(data);

    const applyKernel = (x: number, y: number) => {
        let r = 0, g = 0, b = 0;
        for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
                const posX = x + kx;
                const posY = y + ky;
                if (posX >= 0 && posX < width && posY >= 0 && posY < height) {
                    const index = (posY * width + posX) * 4;
                    const weight = kernel[ky + 1][kx + 1];
                    r += copy[index] * weight;
                    g += copy[index + 1] * weight;
                    b += copy[index + 2] * weight;
                }
            }
        }
        const index = (y * width + x) * 4;
        data[index] = Math.min(Math.max(r, 0), 255);
        data[index + 1] = Math.min(Math.max(g, 0), 255);
        data[index + 2] = Math.min(Math.max(b, 0), 255);
    };

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            applyKernel(x, y);
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

private applyTextureEffect(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = width;
  textureCanvas.height = height;
  const textureCtx = textureCanvas.getContext('2d')!;
  
  // Generate a more pronounced texture pattern
  const texturePattern = textureCtx.createPattern(this.generatePronouncedTexturePattern(), 'repeat')!;
  textureCtx.fillStyle = texturePattern;
  textureCtx.fillRect(0, 0, width, height);

  ctx.globalAlpha = 0.5; // Increase the opacity for a stronger effect
  ctx.drawImage(textureCanvas, 0, 0);
  ctx.globalAlpha = 1.0;
}

private generatePronouncedTexturePattern(): HTMLCanvasElement {
  const size = 16; // Use a smaller size for a denser texture
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = size;
  textureCanvas.height = size;
  const textureCtx = textureCanvas.getContext('2d')!;

  textureCtx.fillStyle = '#fff';
  textureCtx.fillRect(0, 0, size, size);

  textureCtx.fillStyle = '#ccc';
  for (let i = 0; i < size; i += 4) {
      textureCtx.fillRect(i, 0, 2, size);
      textureCtx.fillRect(0, i, size, 2);
  }

  return textureCanvas;
}


  private getCompressionQuality(level?: CompressionLevel): number {
    switch (level) {
      case CompressionLevel.Highest:
        return 0.2;
      case CompressionLevel.High:
        return 0.5;
      case CompressionLevel.Normal:
        return 0.75;
      case CompressionLevel.Low:
        return 0.9;
      default:
        return 0.8;
    }
  }
}
