"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environment = void 0;
exports.environment = {
    databaseUrl: process.env.DATABASE_URL || 'postgresql://questwall:questwall123@localhost:5432/questwall',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    clickhouseUrl: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
};
//# sourceMappingURL=environment.js.map