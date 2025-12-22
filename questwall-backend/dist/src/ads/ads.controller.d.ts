import { AdsService } from './ads.service';
export declare class AdsController {
    private readonly adsService;
    constructor(adsService: AdsService);
    adsgramCallback(callbackDto: any): {
        success: boolean;
        message: string;
    };
    getBillingReport(date: string): {
        date: string;
        totalImpressions: number;
        totalClicks: number;
        totalCost: string;
        currency: string;
    };
}
