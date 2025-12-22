export declare class UploadController {
    uploadImage(file: Express.Multer.File): {
        success: boolean;
        url: string;
        filename: string;
        originalName: string;
        size: number;
    };
}
