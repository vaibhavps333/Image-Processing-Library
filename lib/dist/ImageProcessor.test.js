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
const image_processor_1 = require("./src/services/image-processor");
const globals_1 = require("@jest/globals");
(0, globals_1.describe)("ImageProcessor", () => {
    let processor;
    (0, globals_1.beforeEach)(() => {
        const config = {
            maxFileSizeMB: 5,
            maxImageCount: 3,
            supportedFormats: ["image/jpeg", "image/png"]
        };
        processor = new image_processor_1.ImageProcessor(config);
    });
    (0, globals_1.describe)("validateFiles", () => {
        (0, globals_1.it)("should throw an error if file exceeds maxFileSizeMB", () => {
            const file = new File([new ArrayBuffer(6 * 1024 * 1024)], "test.jpg", { type: "image/jpeg" });
            const files = [file];
            (0, globals_1.expect)(() => processor["validateFiles"](files, {})).toThrow("File size exceeds the maximum limit of 5 MB. File size: 6.00 MB");
        });
        (0, globals_1.it)("should throw an error if file format is not supported", () => {
            const file = new File([new ArrayBuffer(1 * 1024 * 1024)], "test.bmp", { type: "image/bmp" });
            const files = [file];
            (0, globals_1.expect)(() => processor["validateFiles"](files, {})).toThrow("Unsupported file format: image/bmp. Supported formats: image/jpeg, image/png");
        });
        (0, globals_1.it)("should throw an error if more than maxImageCount files are provided", () => {
            const file1 = new File([new ArrayBuffer(1 * 1024 * 1024)], "test1.jpg", { type: "image/jpeg" });
            const file2 = new File([new ArrayBuffer(1 * 1024 * 1024)], "test2.jpg", { type: "image/jpeg" });
            const file3 = new File([new ArrayBuffer(1 * 1024 * 1024)], "test3.jpg", { type: "image/jpeg" });
            const file4 = new File([new ArrayBuffer(1 * 1024 * 1024)], "test4.jpg", { type: "image/jpeg" });
            const files = [file1, file2, file3, file4];
            (0, globals_1.expect)(() => processor["validateFiles"](files, {})).toThrow("Cannot process more than 3 images at a time. Files provided: 4");
        });
    });
    (0, globals_1.describe)("processDirect", () => {
        (0, globals_1.it)("should return the file directly", () => __awaiter(void 0, void 0, void 0, function* () {
            const file = new File([new ArrayBuffer(1 * 1024 * 1024)], "test.jpg", { type: "image/jpeg" });
            const result = yield processor["processDirect"](file);
            (0, globals_1.expect)(result.blob).toBe(file);
            (0, globals_1.expect)(result.dataUrl).toContain("data:image/jpeg;base64");
        }));
    });
    // More tests for other methods...
    (0, globals_1.describe)("processImageWithEnhancement", () => {
        (0, globals_1.it)("should enhance the image with default options", () => __awaiter(void 0, void 0, void 0, function* () {
            const file = new File([new ArrayBuffer(1 * 1024 * 1024)], "test.jpg", { type: "image/jpeg" });
            const result = yield processor["processImageWithEnhancement"](file, {});
            (0, globals_1.expect)(result.blob).toBeInstanceOf(Blob);
        }), 10000); // Increase timeout for this test
    });
    (0, globals_1.describe)("processImageWithCompression", () => {
        (0, globals_1.it)("should compress the image with default options", () => __awaiter(void 0, void 0, void 0, function* () {
            const file = new File([new ArrayBuffer(1 * 1024 * 1024)], "test.jpg", { type: "image/jpeg" });
            const result = yield processor["processImageWithCompression"](file, {});
            (0, globals_1.expect)(result.blob).toBeInstanceOf(Blob);
        }), 10000); // Increase timeout for this test
    });
    (0, globals_1.describe)("processImageWithBoth", () => {
        (0, globals_1.it)("should enhance and then compress the image", () => __awaiter(void 0, void 0, void 0, function* () {
            const file = new File([new ArrayBuffer(1 * 1024 * 1024)], "test.jpg", { type: "image/jpeg" });
            const options = {
                enhancementOptions: { brightness: 10 }
            };
            const result = yield processor["processImageWithBoth"](file, options);
            (0, globals_1.expect)(result.blob).toBeInstanceOf(Blob);
        }), 10000); // Increase timeout for this test
    });
});
