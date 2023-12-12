import { CreatableUtils, ICreatableConfig } from "@rapidstack/lambda";
import { Product } from "src/shared";
import { v4 } from "src/utils";
import { faker } from '@faker-js/faker';

interface DatabaseConfig extends ICreatableConfig {
    latency?: number;
}

export class ProductDatabase {
    private db: Product[] = [];
    private latency: number;
    constructor(utils: CreatableUtils, options?: DatabaseConfig) {
        this.latency = options?.latency ?? 50;
        this.generateFakeData();
    }

    private generateFakeData() {
        for(let i = 0; i < 100; i++) {
            this.db.push({
                id: v4(),
                name: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                price: faker.number.float({ min: 1, max: 1000, precision: 0.01 }),
                image: faker.image.urlLoremFlickr({category: 'products', width: 500, height: 500}),
                active: true
            });
        }

    }
    private async fakeLatency() {
        await new Promise((resolve) => setTimeout(resolve, this.latency));
    }

    public async getProducts(): Promise<Product[]> {
        await this.fakeLatency();
        return this.db;
    }

    public async getProduct(id: string): Promise<Product | undefined> {
        await this.fakeLatency();
        return this.db.find((product) => product.id === id);
    }

    public async addProduct(product: Product): Promise<void> {
        await this.fakeLatency();
        this.db.push(product);
    }

    public async deleteProduct(id: string): Promise<boolean> {
        await this.fakeLatency();
        const item = this.db.find((product) => product.id === id);

        // set the item to inactive instead of deleting it
        if(item) item.active = false;
        return !!item;
    }
}
