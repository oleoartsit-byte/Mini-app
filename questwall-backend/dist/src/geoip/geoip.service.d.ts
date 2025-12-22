import { OnModuleInit } from '@nestjs/common';
export declare class GeoipService implements OnModuleInit {
    private lookup;
    onModuleInit(): Promise<void>;
    getCountryCode(ip: string): string | null;
    getCountryInfo(ip: string): {
        code: string;
        name: string;
    } | null;
    isInCountries(ip: string, countries: string[]): boolean;
    private isPrivateIp;
}
