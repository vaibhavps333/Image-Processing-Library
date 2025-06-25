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
class ImageProcessor {
    constructor(config = {}) {
        this.defaultEnhancementOptions = {
            brightness: 20,
            contrast: 5,
            saturation: 1,
            texture: true,
            sharpening: true
        };
        this.defaultCompressionOptions = {
            level: 'normal'
        };
        this.config = {
            maxFileSizeMB: config.maxFileSizeMB || 50,
            maxImageCount: config.maxImageCount || 10,
            supportedFormats: config.supportedFormats || ['image/*']
        };
    }
    processImages(files_1) {
        return __awaiter(this, arguments, void 0, function* (files, options = {}) {
            this.validateFiles(files);
            const promises = files.map((file) => this.processImage(file, options));
            return Promise.all(promises);
        });
    }
    processImage(file_1) {
        return __awaiter(this, arguments, void 0, function* (file, options = {}) {
            const mode = options.mode || 'compression';
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
            const enhancedImageBlob = yield this.processImageWithEnhancement(file, options.enhancementOptions).then((result) => result.blob);
            const enhancedImageFile = new File([enhancedImageBlob], file.name, {
                type: file.type
            });
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
    validateFiles(files) {
        if (files.length > this.config.maxImageCount) {
            throw new Error(`Cannot process more than ${this.config.maxImageCount} images at a time`);
        }
        for (const file of files) {
            if (file.size > this.config.maxFileSizeMB * 1024 * 1024) {
                throw new Error(`File size exceeds the maximum limit of ${this.config.maxFileSizeMB} MB`);
            }
            // if (!this.config.supportedFormats!.includes(file.type)) {
            //   throw new Error(`Unsupported file format: ${file.type}`);
            // }
        }
    }
    enhanceImage(file, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target.result;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        const imageData = ctx.getImageData(0, 0, img.width, img.height);
                        const data = imageData.data;
                        const defaultEnhancementOptions = {
                            brightness: 20,
                            contrast: 5,
                            saturation: 1,
                            texture: true,
                            sharpening: true
                        };
                        const enhancementSettings = Object.assign(Object.assign({}, defaultEnhancementOptions), options);
                        // Analyze image characteristics
                        const { brightness, contrast } = this.analyzeImage(data);
                        const brightnessAdjustment = brightness < 100 ? 10 : -70;
                        if (enhancementSettings.brightness !== undefined) {
                            this.adjustBrightness(data, brightnessAdjustment);
                        }
                        if (enhancementSettings.contrast !== undefined) {
                            this.adjustContrast(data, contrast);
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
    analyzeImage(data) {
        let totalBrightness = 0;
        let totalContrast = 0;
        const pixelCount = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            totalBrightness += brightness;
            totalContrast +=
                Math.abs(data[i] - brightness) +
                    Math.abs(data[i + 1] - brightness) +
                    Math.abs(data[i + 2] - brightness);
        }
        return {
            brightness: totalBrightness / pixelCount,
            contrast: totalContrast / pixelCount
        };
    }
    adjustBrightness(data, brightnessAdjustment) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = this.clamp(data[i] + brightnessAdjustment);
            data[i + 1] = this.clamp(data[i + 1] + brightnessAdjustment);
            data[i + 2] = this.clamp(data[i + 2] + brightnessAdjustment);
        }
    }
    adjustContrast(data, contrast) {
        const factor = (170 * (contrast + 255)) / (255 * (259 - contrast));
        for (let i = 0; i < data.length; i += 4) {
            data[i] = this.clamp(factor * (data[i] - 128) + 128);
            data[i + 1] = this.clamp(factor * (data[i + 1] - 128) + 128);
            data[i + 2] = this.clamp(factor * (data[i + 2] - 128) + 128);
        }
    }
    adjustSaturation(data, saturation) {
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
            data[i] = this.clamp(gray + saturation * (data[i] - gray));
            data[i + 1] = this.clamp(gray + saturation * (data[i + 1] - gray));
            data[i + 2] = this.clamp(gray + saturation * (data[i + 2] - gray));
        }
    }
    applyTextureEnhancement(ctx, width, height) {
        const textureKernel = [-1, -1, -1, -1, 20, -1, -1, -1, -1];
        this.applyConvolutionFilter(ctx, width, height, textureKernel);
    }
    applyAdvancedSharpeningFilter(ctx, width, height) {
        const advancedSharpeningKernel = [-1, -1, -1, -1, 9, 0, -1, -1, -1];
        this.applyConvolutionFilter(ctx, width, height, advancedSharpeningKernel);
    }
    applyConvolutionFilter(ctx, width, height, kernel) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const side = Math.round(Math.sqrt(kernel.length));
        const halfSide = Math.floor(side / 2);
        const output = ctx.createImageData(width, height);
        const outputData = output.data;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0;
                for (let cy = 0; cy < side; cy++) {
                    for (let cx = 0; cx < side; cx++) {
                        const scy = y + cy - halfSide;
                        const scx = x + cx - halfSide;
                        if (scy >= 0 && scy < height && scx >= 0 && scx < width) {
                            const srcOffset = (scy * width + scx) * 4;
                            const weight = kernel[cy * side + cx];
                            r += data[srcOffset] * weight;
                            g += data[srcOffset + 1] * weight;
                            b += data[srcOffset + 2] * weight;
                        }
                    }
                }
                const dstOffset = (y * width + x) * 4;
                outputData[dstOffset] = this.clamp(r);
                outputData[dstOffset + 1] = this.clamp(g);
                outputData[dstOffset + 2] = this.clamp(b);
                outputData[dstOffset + 3] = 255; // alpha
            }
        }
        ctx.putImageData(output, 0, 0);
    }
    clamp(value, min = 0, max = 255) {
        return Math.min(max, Math.max(min, value));
    }
    clampValue(value, min, max) {
        return Math.min(max, Math.max(min, value));
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
                        let quality = 1.0;
                        if (options.level === 'highest') {
                            quality = 0.2;
                        }
                        else if (options.level === 'high') {
                            quality = 0.5;
                        }
                        else if (options.level === 'normal') {
                            quality = 0.8;
                        }
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        canvas.toBlob((blob) => {
                            const dataUrl = canvas.toDataURL('image/jpeg', quality);
                            resolve({
                                blob: blob,
                                dataUrl,
                                width: img.width,
                                height: img.height
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
