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
// FileValidator implementation
const fileValidator = {
    validateFile(file, maxFileSizeMB, supportedFormats) {
        if (!file) {
            throw new Error('Invalid file');
        }
        if (maxFileSizeMB === undefined || maxFileSizeMB === null) {
            throw new Error('maxFileSizeMB is not defined');
        }
        if (!Array.isArray(supportedFormats) || supportedFormats.length === 0) {
            throw new Error('supportedFormats is not defined or empty');
        }
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxFileSizeMB) {
            throw new Error(`File size exceeds the maximum limit of ${maxFileSizeMB} MB. File size: ${fileSizeMB.toFixed(2)} MB`);
        }
        if (!supportedFormats.includes(file.type)) {
            throw new Error(`Unsupported file format: ${file.type}. Supported formats: ${supportedFormats.join(', ')}`);
        }
    }
};
// Class for processing images
class ImageProcessor {
    // Constructor to initialize the processor configuration
    constructor(config = {}) {
        // Default enhancement options
        this.defaultEnhancementOptions = {
            brightness: 20,
            contrast: 5,
            saturation: 1,
            texture: true,
            sharpening: true
        };
        // Default compression options
        this.defaultCompressionOptions = {
            level: 'normal'
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
    // Method to process multiple images
    processImages(files, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateFiles(files, options);
            // Process each image file
            const promises = files.map(file => this.processImage(file, options));
            return Promise.all(promises);
        });
    }
    // Method to process a single image
    processImage(file, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = options.mode || 'compression';
            // Select the processing mode
            switch (mode) {
                case 'enhancement':
                    return this.processImageWithEnhancement(file, options.enhancementOptions);
                case 'compression':
                    return this.processImageWithCompression(file, options.compressionOptions);
                case 'both':
                    return this.processImageWithBoth(file, options);
                case 'direct':
                    return this.processDirect(file);
                default:
                    throw new Error('Invalid processing mode');
            }
        });
    }
    // Method to process an image with enhancement
    processImageWithEnhancement(file, enhancementOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = Object.assign(Object.assign({}, this.defaultEnhancementOptions), enhancementOptions);
            return this.enhanceImage(file, options);
        });
    }
    // Method to process an image with compression
    processImageWithCompression(file, compressionOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = Object.assign(Object.assign({}, this.defaultCompressionOptions), compressionOptions);
            return this.compressImage(file, options);
        });
    }
    // Method to process an image with both enhancement and compression
    processImageWithBoth(file, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // First, enhance the image
            const enhancedImageBlob = yield this.processImageWithEnhancement(file, options.enhancementOptions).then(result => result.blob);
            const enhancedImageFile = new File([enhancedImageBlob], file.name, {
                type: file.type
            });
            // Then, compress the enhanced image
            return this.processImageWithCompression(enhancedImageFile, options.compressionOptions);
        });
    }
    // Method to directly return the file without processing
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
    // Method to validate the input files
    validateFiles(files, options) {
        const mergedOptions = Object.assign(Object.assign({}, this.config), options);
        const { maxFileSizeMB, supportedFormats, maxImageCount } = mergedOptions;
        if (maxImageCount === undefined || maxImageCount === null) {
            throw new Error('maxImageCount is not defined');
        }
        if (files.length > maxImageCount) {
            throw new Error(`Cannot process more than ${maxImageCount} images at a time. Files provided: ${files.length}`);
        }
        files.forEach(file => {
            try {
                fileValidator.validateFile(file, maxFileSizeMB, supportedFormats);
            }
            catch (error) {
                throw error; // Re-throw the error to propagate it up
            }
        });
    }
    // Method to enhance an image
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
                        // Analyze image characteristics
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
                        if (enhancementSettings.texture) {
                            this.applyTextureEnhancement(ctx, img.width, img.height);
                        }
                        if (enhancementSettings.sharpening) {
                            this.applyAdvancedSharpeningFilter(ctx, img.width, img.height);
                        }
                        ctx.putImageData(imageData, 0, 0);
                        canvas.toBlob((blob) => {
                            const dataUrl = canvas.toDataURL('image/jpeg');
                            resolve({
                                blob: blob,
                                dataUrl,
                                width: img.width,
                                height: img.height
                            });
                        }, 'image/jpeg');
                    };
                    img.onerror = reject;
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });
    }
    // Method to analyze image characteristics
    analyzeImage(data) {
        let totalBrightness = 0;
        let totalContrast = 0;
        const pixelCount = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            totalBrightness += brightness;
            totalContrast += Math.abs(data[i] - brightness);
        }
        const averageBrightness = totalBrightness / pixelCount;
        const averageContrast = totalContrast / pixelCount;
        return {
            brightness: averageBrightness,
            contrast: averageContrast
        };
    }
    // Method to adjust brightness of image data
    adjustBrightness(data, brightness) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, data[i] + brightness));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightness));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightness));
        }
    }
    // Method to adjust contrast of image data
    adjustContrast(data, contrast) {
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
            data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
            data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
        }
    }
    // Method to adjust saturation of image data
    adjustSaturation(data, saturation) {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
            data[i] = Math.min(255, Math.max(0, gray + (r - gray) * saturation));
            data[i + 1] = Math.min(255, Math.max(0, gray + (g - gray) * saturation));
            data[i + 2] = Math.min(255, Math.max(0, gray + (b - gray) * saturation));
        }
    }
    // Method to apply texture enhancement to image data
    applyTextureEnhancement(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const filter = [
            -1, -1, -1,
            -1, 10, 1,
            -1, -1, -1
        ];
        const side = Math.round(Math.sqrt(filter.length));
        const halfSide = Math.floor(side / 2);
        const output = ctx.createImageData(width, height);
        const outputData = output.data;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const sy = y;
                const sx = x;
                const dstOff = (y * width + x) * 4;
                let r = 0, g = 0, b = 0;
                for (let cy = 0; cy < side; cy++) {
                    for (let cx = 0; cx < side; cx++) {
                        const scy = sy + cy - halfSide;
                        const scx = sx + cx - halfSide;
                        if (scy >= 0 && scy < height && scx >= 0 && scx < width) {
                            const srcOff = (scy * width + scx) * 4;
                            const wt = filter[cy * side + cx];
                            r += data[srcOff] * wt;
                            g += data[srcOff + 1] * wt;
                            b += data[srcOff + 2] * wt;
                        }
                    }
                }
                outputData[dstOff] = r;
                outputData[dstOff + 1] = g;
                outputData[dstOff + 2] = b;
                outputData[dstOff + 3] = 255;
            }
        }
        ctx.putImageData(output, 0, 0);
    }
    // Method to apply sharpening filter to image data
    applyAdvancedSharpeningFilter(ctx, width, height) {
        const weights = [0, -1, 0, -1, 9, -1, 0, -1, 0];
        const katet = Math.round(Math.sqrt(weights.length));
        const half = (katet * 0.5) | 0;
        const dstData = ctx.createImageData(width, height);
        const dstBuff = dstData.data;
        const srcBuff = ctx.getImageData(0, 0, width, height).data;
        for (let y = height; y--;) {
            for (let x = width; x--;) {
                let sy = y;
                let sx = x;
                let dstOff = (y * width + x) * 4;
                let r = 0, g = 0, b = 0, a = 0;
                for (let cy = 0; cy < katet; cy++) {
                    for (let cx = 0; cx < katet; cx++) {
                        const scy = sy + cy - half;
                        const scx = sx + cx - half;
                        if (scy >= 0 && scy < height && scx >= 0 && scx < width) {
                            let srcOff = (scy * width + scx) * 4;
                            let wt = weights[cy * katet + cx];
                            r += srcBuff[srcOff] * wt;
                            g += srcBuff[srcOff + 1] * wt;
                            b += srcBuff[srcOff + 2] * wt;
                            a += srcBuff[srcOff + 3] * wt;
                        }
                    }
                }
                dstBuff[dstOff] = r;
                dstBuff[dstOff + 1] = g;
                dstBuff[dstOff + 2] = b;
                dstBuff[dstOff + 3] = a;
            }
        }
        ctx.putImageData(dstData, 0, 0);
    }
    // Method to compress an image
    compressImage(file, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target.result;
                    img.onload = () => {
                        let width = img.width;
                        let height = img.height;
                        let quality;
                        let maxDimension;
                        // Set default values based on the compression level
                        switch (options.level) {
                            case 'low':
                                quality = 0.9; // Highest quality, lowest compression
                                maxDimension = img.width; // Original image dimension
                                break;
                            case 'normal':
                                quality = 0.75; // High quality, moderate compression
                                maxDimension = 2000;
                                break;
                            case 'high':
                                quality = 0.5; // Normal quality, higher compression
                                maxDimension = 1500;
                                break;
                            default:
                                quality = 0.75; // Lowest quality, highest compression
                                maxDimension = 2000;
                                break;
                        }
                        // Use provided maxDimension if available
                        if (options.maxDimension) {
                            maxDimension = options.maxDimension;
                        }
                        // Resize the image if necessary
                        if (width > maxDimension || height > maxDimension) {
                            if (width > height) {
                                height *= maxDimension / width;
                                width = maxDimension;
                            }
                            else {
                                width *= maxDimension / height;
                                height = maxDimension;
                            }
                        }
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);
                        canvas.toBlob((blob) => {
                            const dataUrl = canvas.toDataURL('image/jpeg', quality);
                            resolve({
                                blob: blob,
                                dataUrl,
                                width,
                                height
                            });
                        }, 'image/jpeg', quality);
                    };
                    img.onerror = reject;
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });
    }
}
exports.ImageProcessor = ImageProcessor;
