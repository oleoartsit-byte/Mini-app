"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("../auth.service");
const jwt_1 = require("@nestjs/jwt");
describe('AuthService', () => {
    let service;
    let jwtService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                {
                    provide: jwt_1.JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue('test-token'),
                        verify: jest.fn().mockReturnValue({ tg_id: 123456789 }),
                    },
                },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        jwtService = module.get(jwt_1.JwtService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('telegramAuth', () => {
        it('should generate JWT token for valid initData', async () => {
            const initData = 'user=%7B%22id%22%3A123456789%7D&hash=valid_hash';
            process.env.TELEGRAM_BOT_TOKEN = 'test_bot_token';
            const result = await service.telegramAuth(initData);
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('expiresIn');
            expect(result).toHaveProperty('user');
            expect(jwtService.sign).toHaveBeenCalled();
        });
    });
    describe('refreshToken', () => {
        it('should refresh valid token', async () => {
            const token = 'valid-token';
            const result = await service.refreshToken(token);
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('expiresIn');
            expect(jwtService.verify).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map