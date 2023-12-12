import { CreatableUtils, ICreatableConfig } from "@rapidstack/lambda";
import { User } from "src/shared";
import { v4 } from "src/utils";
import { faker } from '@faker-js/faker';

interface DatabaseConfig extends ICreatableConfig {
    latency?: number;
    tokenLimit?: number;
    cooldownMs?: number;
}

export class RateLimitDatabase {
    private db: User[] = [];
    private latency: number;
    private tokenLimit: number;
    private cooldownMs: number;
    constructor(utils: CreatableUtils, options?: DatabaseConfig) {
        this.latency = options?.latency ?? 50;
        this.tokenLimit = options?.tokenLimit ?? 10;
        this.cooldownMs = options?.cooldownMs ?? 1000 * 60; // 1 minute
    }

    private async fakeLatency() {
        await new Promise((resolve) => setTimeout(resolve, this.latency));
    }

    private async getUser(identifier: User['ip'] | User['hash']): Promise<User | undefined> {
        await this.fakeLatency();
        return this.db.find((user) => user.ip === identifier || user.hash === identifier);
    }
    
    public async addUser(user: Omit<User, 'tokens'>): Promise<void> {
        await this.fakeLatency();
        this.db.push({ ...user, tokens: [] });
    }

    public async subtractToken(identifier: User['ip'] | User['hash']): Promise<void> {
        await this.fakeLatency();
        const user = await this.getUser(identifier);
        if (user) user.tokens.push(Date.now()) 
    }

    public async getRemainingTokens(identifier: User['ip'] | User['hash']): Promise<number | undefined> {
        const user = await this.getUser(identifier);
        if (user) {
            const now = Date.now();
            const tokens = user.tokens.filter((token) => now - token < this.cooldownMs);
            user.tokens = tokens;
            return this.tokenLimit - tokens.length > 0 ? this.tokenLimit - tokens.length : 0;
        }
        return undefined
    }
}
