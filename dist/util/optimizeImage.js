"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimizeImage = void 0;
const tslib_1 = require("tslib");
const sharp_1 = tslib_1.__importDefault(require("sharp"));
const path_1 = tslib_1.__importDefault(require("path"));
const logger_1 = tslib_1.__importDefault(require("./logger"));
const IMAGE_PRESETS = {
    profile: { width: 300, height: 300, quality: 80, format: 'jpeg' },
    post: { width: 1080, quality: 75, format: 'jpeg' },
    story: { width: 1280, quality: 85, format: 'jpeg' }
};
const optimizeImage = async (originalPath, type = 'post') => {
    try {
        const { width, height, quality, format } = IMAGE_PRESETS[type];
        const ext = format === 'jpeg' ? '.jpg' : '.webp';
        const optimizedPath = path_1.default.join(path_1.default.dirname(originalPath), `${path_1.default.basename(originalPath, path_1.default.extname(originalPath))}-optimized${ext}`);
        const transformer = (0, sharp_1.default)(originalPath).resize({ width, height }).toFormat(format, { quality });
        await transformer.toFile(optimizedPath);
        return optimizedPath;
    }
    catch (error) {
        logger_1.default.error(error);
        return '';
    }
};
exports.optimizeImage = optimizeImage;
//# sourceMappingURL=optimizeImage.js.map