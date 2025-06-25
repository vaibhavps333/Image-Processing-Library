import { CompressionLevel } from './src/enums/compression-level';
import { ImageProcessingMode } from './src/enums/image-processing-mode';
import { EnhancementOptions } from './src/models/enhancement-options';
import { CompressionOptions } from './src/models/compression-options';
import { ImageProcessingOptions } from './src/models/image-processing-options';
import { ErrorConstants } from './src/services/error-constants';
import { fileValidator } from './src/services/file-validator';
import { ImageProcessor } from './src/services/image-processor';

import { describe, expect, it, beforeEach } from "@jest/globals";
describe("ImageProcessor", () => {
  let processor: ImageProcessor;

  beforeEach(() => {
    const config: ImageProcessingOptions = {
      maxFileSizeMB: 5,
      maxImageCount: 3,
      supportedFormats: ["image/jpeg", "image/png"]
    };
    processor = new ImageProcessor(config);
  });

  describe("validateFiles", () => {
    it("should throw an error if file exceeds maxFileSizeMB", () => {
      const file = new File([new ArrayBuffer(6 * 1024 * 1024)], "test.jpg", { type: "image/jpeg" });
      const files = [file];
      expect(() => processor["validateFiles"](files, {})).toThrow("File size exceeds the maximum limit of 5 MB. File size: 6.00 MB");
    });

    it("should throw an error if file format is not supported", () => {
      const file = new File([new ArrayBuffer(1 * 1024 * 1024)], "test.bmp", { type: "image/bmp" });
      const files = [file];
      expect(() => processor["validateFiles"](files, {})).toThrow("Unsupported file format: image/bmp. Supported formats: image/jpeg, image/png");
    });

    it("should throw an error if more than maxImageCount files are provided", () => {
      const file1 = new File([new ArrayBuffer(1 * 1024 * 1024)], "test1.jpg", { type: "image/jpeg" });
      const file2 = new File([new ArrayBuffer(1 * 1024 * 1024)], "test2.jpg", { type: "image/jpeg" });
      const file3 = new File([new ArrayBuffer(1 * 1024 * 1024)], "test3.jpg", { type: "image/jpeg" });
      const file4 = new File([new ArrayBuffer(1 * 1024 * 1024)], "test4.jpg", { type: "image/jpeg" });
      const files = [file1, file2, file3, file4];
      expect(() => processor["validateFiles"](files, {})).toThrow("Cannot process more than 3 images at a time. Files provided: 4");
    });
  });

  describe("processDirect", () => {
    it("should return the file directly", async () => {
      const file = new File([new ArrayBuffer(1 * 1024 * 1024)], "test.jpg", { type: "image/jpeg" });
      const result = await processor["processDirect"](file);
      expect(result.blob).toBe(file);
      expect(result.dataUrl).toContain("data:image/jpeg;base64");
    });
  });

  // More tests for other methods...

  describe("processImageWithEnhancement", () => {
    it("should enhance the image with default options", async () => {
      const file = new File([new ArrayBuffer(1 * 1024 * 1024)], "test.jpg", { type: "image/jpeg" });
      const result = await processor["processImageWithEnhancement"](file, {});
      expect(result.blob).toBeInstanceOf(Blob);
    }, 10000); // Increase timeout for this test
  });

  describe("processImageWithCompression", () => {
    it("should compress the image with default options", async () => {
      const file = new File([new ArrayBuffer(1 * 1024 * 1024)], "test.jpg", { type: "image/jpeg" });
      const result = await processor["processImageWithCompression"](file, {});
      expect(result.blob).toBeInstanceOf(Blob);
    }, 10000); // Increase timeout for this test
  });

  describe("processImageWithBoth", () => {
    it("should enhance and then compress the image", async () => {
      const file = new File([new ArrayBuffer(1 * 1024 * 1024)], "test.jpg", { type: "image/jpeg" });
      const options = {
        enhancementOptions: { brightness: 10 }
      };
      const result = await processor["processImageWithBoth"](file, options);
      expect(result.blob).toBeInstanceOf(Blob);
    }, 10000); // Increase timeout for this test
  });
});
