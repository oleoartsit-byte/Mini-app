export declare class AdsService {
    handleAdsgramCallback(callbackDto: any): {
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
