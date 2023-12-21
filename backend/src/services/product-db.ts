import { CreatableUtils, ICreatableConfig } from "@rapidstack/lambda";
import { Product, ProductGetFilterCriteria, ProductNoId, ProductSortOptions } from "@project/core/objects";
import { v4 } from "uuid";
import { faker } from '@faker-js/faker';

interface DatabaseConfig extends ICreatableConfig {
    latency?: number;
}

type ProductDatabaseObject = Product & {
  active: boolean;
  created: Date;
  updated: Date;
}

export class ProductDatabase {
  private db: ProductDatabaseObject[] = [];
  private latency: number;
  constructor(utils: CreatableUtils, options?: DatabaseConfig) {
      this.latency = options?.latency ?? 50;
      this.generateFakeData();
  }

  /**
   * Mocks of database queries:
   */

  private generateFakeData() {
    for(let i = 0; i < 99; i++) {
      this.db.push({
        id: v4(),
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.number.float({ min: 1, max: 1000, precision: 0.01 }),
        image: faker.image.urlLoremFlickr({category: 'products', width: 500, height: 500}),
        active: Math.random() > 0.25,
        created: faker.date.past({ years: 3 }),
        updated: faker.date.past({ years: 1 }),
      });
    }

    // This one should always exist for consistency in calls for this UUID:
    this.db.push({
      id: 'd63742a2-ffd2-42fc-abb9-314d0d16c946',
      name: 'Default Test Product',
      description: 'This is a test product that should always exist in the database.',
      price: 25.99,
      image: 'https://loremflickr.com/500/500/products?lock=1',
      active: true,
      created: faker.date.past({ years: 3 }),
      updated: faker.date.past({ years: 1 }),
    });
  }

  private async fakeLatency() {
    await new Promise((resolve) => setTimeout(resolve, this.latency));
  }

  private async runGetProductQuery(id: string): Promise<ProductDatabaseObject | undefined> {
    await this.fakeLatency();
    const item = this.db.find((product) => product.id === id);
    return item;
  }

  private async runGetProductsQuery(criteria?: ProductGetFilterCriteria): Promise<ProductDatabaseObject[]> {
    await this.fakeLatency();

    const items: ProductDatabaseObject[] = [];
    const defaultLimit = criteria?.['per-page'] ?? 10;
    const defaultPage = criteria?.page ?? 1;

    for (let entry of this.db) {
      if (!entry.active) continue;
      if (criteria?.['max-price'] && entry.price > criteria['max-price']) continue;
      if (criteria?.['min-price'] && entry.price < criteria['min-price']) continue;
      if (criteria?.search && !entry.name.toLowerCase().includes(criteria.search)) continue;
      
      items.push(entry);
    }

    if (criteria?.sort) {
      switch(criteria.sort) {
        case ProductSortOptions.NAME_ASC:
          items.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case ProductSortOptions.NAME_DESC:
          items.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case ProductSortOptions.PRICE_ASC:
          items.sort((a, b) => a.price - b.price);
          break;
        case ProductSortOptions.PRICE_DESC:
          items.sort((a, b) => b.price - a.price);
          break;
      }
    }

    const limit = criteria?.['per-page'] ?? defaultLimit;
    const page = criteria?.page ?? defaultPage;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return items.slice(start, end);
  }

  private async runCreateProductQuery(product: ProductNoId): Promise<ProductDatabaseObject> {
    await this.fakeLatency();

    const newProduct = {
      ...product,
      id: v4(),
      active: true,
      created: new Date(),
      updated: new Date(),
    };

    this.db.push(newProduct);
    return newProduct as ProductDatabaseObject;
  }

  private async runUpdateQuery(product: Partial<Product>): Promise<ProductDatabaseObject> {
    await this.fakeLatency();
    
    const index = this.db.findIndex((item) => item.id === product.id);
    
    if (index === -1) throw new DatabaseEntryNotFoundError(`${product.id} not found`);
    if (!this.db[index].active) throw new DatabaseEntryLockedError(`${product.id} is locked`);
    
    const updatedProduct = {
      ...this.db[index],
      ...product,
      updated: new Date(),
    };

    this.db[index] = updatedProduct;

    return updatedProduct;
  }

  private async runDeleteQuery(id: string): Promise<ProductDatabaseObject> {
    await this.fakeLatency();

    const index = this.db.findIndex((item) => item.id === id);
    if (index === -1) throw new DatabaseEntryNotFoundError(`${id} not found`);

    const item = this.db[index];
    if (!item.active) throw new DatabaseEntryLockedError(`${id} is locked`);

    item.active = false;
    item.updated = new Date();

    return item;
  }

  /**
   * Class methods that implement the database queries:
   */
  
  public async getProducts(criteria?: ProductGetFilterCriteria): Promise<Product[]> {
    const items = await this.runGetProductsQuery(criteria);
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
    }));
  }

  public async getProduct(id: string): Promise<Product | undefined> {
    const item = await this.runGetProductQuery(id);
    if (!item) return undefined;

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
    };
  }

  /**
   * If there was a system that used patch, this would probably be the method used for it.
   */
  public async upsertProduct(product: Product): Promise<Product> {
    const existingProduct = await this.runGetProductQuery(product.id);

    const fullProduct: ProductDatabaseObject = {
      ...product,
      active: true,
      created: existingProduct?.created ?? new Date(),
      updated: new Date(),
    };

    if (existingProduct) {
      const res = await this.runUpdateQuery(fullProduct);
      return {
        id: res.id,
        name: res.name,
        description: res.description,
        price: res.price,
        image: res.image,
      }
    }

    const res = await this.createProduct(fullProduct);
    return {
      id: res.id,
      name: res.name,
      description: res.description,
      price: res.price,
      image: res.image,
    };
  }

  public async updateProduct(product: Partial<Product> & { id: string }): Promise<Product> {
    const res = await this.runUpdateQuery(product);
    return {
      id: res.id,
      name: res.name,
      description: res.description,
      price: res.price,
      image: res.image,
    };
  }

  public async createProduct(product: ProductNoId): Promise<Product> {
    const res = await this.runCreateProductQuery(product);
    return {
      id: res.id,
      name: res.name,
      description: res.description,
      price: res.price,
      image: res.image,
    };
  }

  public async deleteProduct(id: string): Promise<Product> {
    const res = await this.runDeleteQuery(id);
    return {
      id: res.id,
      name: res.name,
      description: res.description,
      price: res.price,
      image: res.image,
    };
  }
}

export class DatabaseEntryNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseEntryNotFound';
  }
}

export class DatabaseEntryAlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseEntryAlreadyExists';
  }
}

export class DatabaseEntryLockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseEntryLocked';
  }
}