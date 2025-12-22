export declare class BillingService {
    getReport(date: string): {
        date: string;
        totalRevenue: string;
        totalPayout: string;
        netProfit: string;
        currency: string;
    };
}
