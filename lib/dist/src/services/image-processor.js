"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageProcessor = void 0;
const image_processing_mode_1 = require("../enums/image-processing-mode");
const compression_level_1 = require("../enums/compression-level");
const error_constants_1 = require("./error-constants");
const file_validator_1 = require("./file-validator");
class ImageProcessor {
    constructor(config = {}) {
        this.defaultEnhancementOptions = {
            brightness: -10,
            contrast: 45,
            saturation: 1,
            texture: true,
            sharpening: true
        };
        this.defaultCompressionOptions = {
            level: compression_level_1.CompressionLevel.Normal
        };
        this.config = {
            maxFileSizeMB: config.maxFileSizeMB || 5,
            maxImageCount: config.maxImageCount || 1,
            supportedFormats: config.supportedFormats || [
                'image/jpeg', 'image/png', 'image/gif', 'image/bmp',
                'image/webp', 'image/tiff', 'image/x-icon',
                'image/svg+xml', 'image/heif', 'image/heic', 'image/jfif'
            ]
        };
    }
    processImages(files, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateFiles(files, options);
            const promises = files.map(file => this.processImage(file, options));
            return Promise.all(promises);
        });
    }
    processImage(file, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = options.mode || image_processing_mode_1.ImageProcessingMode.Compression;
            switch (mode) {
                case image_processing_mode_1.ImageProcessingMode.Enhancement:
                    return this.processImageWithEnhancement(file, options.enhancementOptions);
                case image_processing_mode_1.ImageProcessingMode.Compression:
                    return this.processImageWithCompression(file, options.compressionOptions);
                case image_processing_mode_1.ImageProcessingMode.Both:
                    return this.processImageWithBoth(file, options);
                case image_processing_mode_1.ImageProcessingMode.Direct:
                    return this.processDirect(file);
                default:
                    throw new Error(error_constants_1.ErrorConstants.InvalidProcessingMode);
            }
        });
    }
    processImageWithEnhancement(file, enhancementOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = Object.assign(Object.assign({}, this.defaultEnhancementOptions), enhancementOptions);
            return this.enhanceImage(file, options);
        });
    }
    processImageWithCompression(file, compressionOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = Object.assign(Object.assign({}, this.defaultCompressionOptions), compressionOptions);
            return this.compressImage(file, options);
        });
    }
    processImageWithBoth(file, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const enhancedImageBlob = yield this.processImageWithEnhancement(file, options.enhancementOptions).then(result => result.blob);
            const enhancedImageFile = new File([enhancedImageBlob], file.name, { type: file.type });
            return this.processImageWithCompression(enhancedImageFile, options.compressionOptions);
        });
    }
    processDirect(file) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
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
        });
    }
    validateFiles(files, options) {
        const mergedOptions = Object.assign(Object.assign({}, this.config), options);
        const { maxFileSizeMB, supportedFormats, maxImageCount } = mergedOptions;
        if (maxImageCount === undefined || maxImageCount === null) {
            throw new Error(error_constants_1.ErrorConstants.MaxImageCountNotDefined);
        }
        if (files.length > maxImageCount) {
            throw new Error(error_constants_1.ErrorConstants.ExceedMaxImageCount(maxImageCount, files.length));
        }
        files.forEach(file => {
            try {
                file_validator_1.fileValidator.validateFile(file, maxFileSizeMB, supportedFormats);
            }
            catch (error) {
                throw error;
            }
        });
    }
    enhanceImage(file, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target.result;
                    img.onload = () => {
                        var _a;
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        const imageData = ctx.getImageData(0, 0, img.width, img.height);
                        const data = imageData.data;
                        const enhancementSettings = Object.assign(Object.assign({}, this.defaultEnhancementOptions), options);
                        const { brightness } = this.analyzeImage(data);
                        const brightnessAdjustment = (_a = enhancementSettings.brightness) !== null && _a !== void 0 ? _a : (brightness < 100 ? 10 : -70);
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
                                blob: blob,
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
        });
    }
    compressImage(file, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target.result;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        let { width, height } = img;
                        if (options.maxDimension) {
                            const maxDimension = options.maxDimension;
                            if (width > height) {
                                if (width > maxDimension) {
                                    height *= maxDimension / width;
                                    width = maxDimension;
                                }
                            }
                            else {
                                if (height > maxDimension) {
                                    width *= maxDimension / height;
                                    height = maxDimension;
                                }
                            }
                        }
                        const compressionQuality = this.getCompressionQuality(options.level);
                        canvas.width = width * compressionQuality;
                        canvas.height = height * compressionQuality;
                        ctx.drawImage(img, 0, 0, width, height);
                        canvas.toBlob(blob => {
                            resolve({
                                blob: blob,
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
        });
    }
    analyzeImage(data) {
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
    adjustBrightness(data, adjustment) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] += adjustment;
            data[i + 1] += adjustment;
            data[i + 2] += adjustment;
        }
    }
    adjustContrast(data, contrast) {
        const factor = (170 * (contrast + 255)) / (255 * (259 - contrast));
        for (let i = 0; i < data.length; i += 4) {
            data[i] = factor * (data[i] - 128) + 128;
            data[i + 1] = factor * (data[i + 1] - 128) + 128;
            data[i + 2] = factor * (data[i + 2] - 128) + 128;
        }
    }
    adjustSaturation(data, saturation) {
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
    applySharpeningFilter(imageData, ctx) {
        const kernel = [
            [0, -1, 0],
            [-1, 5, -1],
            [0, -1, 0]
        ];
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const copy = new Uint8ClampedArray(data);
        const applyKernel = (x, y) => {
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
    applyTextureEffect(ctx, width, height) {
        const textureCanvas = document.createElement('canvas');
        textureCanvas.width = width;
        textureCanvas.height = height;
        const textureCtx = textureCanvas.getContext('2d');
        // Generate a more pronounced texture pattern
        const texturePattern = textureCtx.createPattern(this.generatePronouncedTexturePattern(), 'repeat');
        textureCtx.fillStyle = texturePattern;
        textureCtx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 0.5; // Increase the opacity for a stronger effect
        ctx.drawImage(textureCanvas, 0, 0);
        ctx.globalAlpha = 1.0;
    }
    generatePronouncedTexturePattern() {
        const size = 16; // Use a smaller size for a denser texture
        const textureCanvas = document.createElement('canvas');
        textureCanvas.width = size;
        textureCanvas.height = size;
        const textureCtx = textureCanvas.getContext('2d');
        textureCtx.fillStyle = '#fff';
        textureCtx.fillRect(0, 0, size, size);
        textureCtx.fillStyle = '#ccc';
        for (let i = 0; i < size; i += 4) {
            textureCtx.fillRect(i, 0, 2, size);
            textureCtx.fillRect(0, i, size, 2);
        }
        return textureCanvas;
    }
    getCompressionQuality(level) {
        switch (level) {
            case compression_level_1.CompressionLevel.Highest:
                return 0.2;
            case compression_level_1.CompressionLevel.High:
                return 0.5;
            case compression_level_1.CompressionLevel.Normal:
                return 0.75;
            case compression_level_1.CompressionLevel.Low:
                return 0.9;
            default:
                return 0.8;
        }
    }
}
exports.ImageProcessor = ImageProcessor;
