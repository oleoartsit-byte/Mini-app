import { Injectable, OnModuleInit } from '@nestjs/common';
import * as maxmind from 'maxmind';
import { CountryResponse } from 'maxmind';
import * as path from 'path';

@Injectable()
export class GeoipService implements OnModuleInit {
  private lookup: maxmind.Reader<CountryResponse> | null = null;

  async onModuleInit() {
    try {
      const dbPath = path.join(process.cwd(), 'GeoLite2-Country.mmdb');
      this.lookup = await maxmind.open<CountryResponse>(dbPath);
      console.log('GeoIP database loaded successfully');
    } catch (error) {
      console.error('Failed to load GeoIP database:', error.message);
    }
  }

  // 根据 IP 获取国家代码（如 CN, US, JP）
  getCountryCode(ip: string): string | null {
    if (!this.lookup) {
      console.warn('GeoIP database not loaded');
      return null;
    }

    try {
      // 处理本地 IP
      if (this.isPrivateIp(ip)) {
        return null;
      }

      const result = this.lookup.get(ip);
      return result?.country?.iso_code || null;
    } catch (error) {
      console.error(`Failed to lookup IP ${ip}:`, error.message);
      return null;
    }
  }

  // 根据 IP 获取完整国家信息
  getCountryInfo(ip: string): { code: string; name: string } | null {
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
    } catch (error) {
      return null;
    }
  }

  // 检查 IP 是否在指定国家列表中
  isInCountries(ip: string, countries: string[]): boolean {
    const countryCode = this.getCountryCode(ip);
    if (!countryCode) {
      return false;
    }
    return countries.includes(countryCode);
  }

  // 检查是否为私有 IP
  private isPrivateIp(ip: string): boolean {
    // IPv4 私有地址
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
}
