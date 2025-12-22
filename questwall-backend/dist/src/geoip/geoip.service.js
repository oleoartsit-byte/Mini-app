"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoipService = void 0;
const common_1 = require("@nestjs/common");
const maxmind = require("maxmind");
const path = require("path");
let GeoipService = class GeoipService {
    constructor() {
        this.lookup = null;
    }
    async onModuleInit() {
        try {
            const dbPath = path.join(process.cwd(), 'GeoLite2-Country.mmdb');
            this.lookup = await maxmind.open(dbPath);
            console.log('GeoIP database loaded successfully');
        }
        catch (error) {
            console.error('Failed to load GeoIP database:', error.message);
        }
    }
    getCountryCode(ip) {
        if (!this.lookup) {
            console.warn('GeoIP database not loaded');
            return null;
        }
        try {
            if (this.isPrivateIp(ip)) {
                return null;
            }
            const result = this.lookup.get(ip);
            return result?.country?.iso_code || null;
        }
        catch (error) {
            console.error(`Failed to lookup IP ${ip}:`, error.message);
            return null;
        }
    }
    getCountryInfo(ip) {
        if (!this.lookup) {
            return null;
        }
        try {
            if (this.isPrivateIp(ip)) {
                return null;
            }
            const result = this.lookup.get(ip);
            if (result?.country) {
                return {
                    code: result.country.iso_code || '',
                    name: result.country.names?.en || result.country.names?.['zh-CN'] || '',
                };
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    isInCountries(ip, countries) {
        const countryCode = this.getCountryCode(ip);
        if (!countryCode) {
            return false;
        }
        return countries.includes(countryCode);
    }
    isPrivateIp(ip) {
        if (ip.startsWith('10.') ||
            ip.startsWith('172.16.') || ip.startsWith('172.17.') || ip.startsWith('172.18.') ||
            ip.startsWith('172.19.') || ip.startsWith('172.20.') || ip.startsWith('172.21.') ||
            ip.startsWith('172.22.') || ip.startsWith('172.23.') || ip.startsWith('172.24.') ||
            ip.startsWith('172.25.') || ip.startsWith('172.26.') || ip.startsWith('172.27.') ||
            ip.startsWith('172.28.') || ip.startsWith('172.29.') || ip.startsWith('172.30.') ||
            ip.startsWith('172.31.') ||
            ip.startsWith('192.168.') ||
            ip === '127.0.0.1' ||
            ip === '::1' ||
            ip === 'localhost') {
            return true;
        }
        return false;
    }
};
exports.GeoipService = GeoipService;
exports.GeoipService = GeoipService = __decorate([
    (0, common_1.Injectable)()
], GeoipService);
//# sourceMappingURL=geoip.service.js.map