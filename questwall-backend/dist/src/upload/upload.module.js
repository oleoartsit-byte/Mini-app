"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const upload_controller_1 = require("./upload.controller");
let UploadModule = class UploadModule {
};
exports.UploadModule = UploadModule;
exports.UploadModule = UploadModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.diskStorage)({
                    destination: (0, path_1.join)(__dirname, '../../uploads'),
                    filename: (req, file, cb) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                        const ext = (0, path_1.extname)(file.originalname);
                        cb(null, `${uniqueSuffix}${ext}`);
                    },
                }),
                limits: {
                    fileSize: 5 * 1024 * 1024,
                },
                fileFilter: (req, file, cb) => {
                    if (file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
                        cb(null, true);
                    }
                    else {
                        cb(new Error('只支持 jpg, jpeg, png, gif, webp 格式的图片'), false);
                    }
                },
            }),
        ],
        controllers: [upload_controller_1.UploadController],
    })
], UploadModule);
//# sourceMappingURL=upload.module.js.map