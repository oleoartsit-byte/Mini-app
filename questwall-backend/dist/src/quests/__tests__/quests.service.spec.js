"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const quests_service_1 = require("../quests.service");
describe('QuestsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [quests_service_1.QuestsService],
        }).compile();
        service = module.get(quests_service_1.QuestsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('findAll', () => {
        it('should return quest list with pagination', async () => {
            const result = await service.findAll(1, 20);
            expect(result).toHaveProperty('items');
            expect(result).toHaveProperty('total');
            expect(Array.isArray(result.items)).toBe(true);
        });
    });
    describe('claim', () => {
        it('should claim a quest successfully', async () => {
            const result = await service.claim(BigInt(123456789), BigInt(1));
            expect(result).toHaveProperty('success', true);
            expect(result).toHaveProperty('message');
        });
    });
    describe('submit', () => {
        it('should submit quest proof successfully', async () => {
            await service.claim(BigInt(123456789), BigInt(1));
            const result = await service.submit(BigInt(123456789), BigInt(1), { proof: { data: 'test_proof' } });
            expect(result).toHaveProperty('success', true);
            expect(result).toHaveProperty('message');
        });
    });
    describe('reward', () => {
        it('should reward a quest successfully', async () => {
            await service.claim(BigInt(123456789), BigInt(1));
            const result = await service.reward(BigInt(123456789), BigInt(1));
            expect(result).toHaveProperty('success', true);
            expect(result).toHaveProperty('message');
        });
    });
});
//# sourceMappingURL=quests.service.spec.js.map