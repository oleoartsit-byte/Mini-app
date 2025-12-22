import { BillingService } from './billing.service';
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
    getReport(date: string): {
        date: string;
        totalRevenue: string;
        totalPayout: string;
        netProfit: string;
        currency: string;
    };
}
