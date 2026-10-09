export interface Store {
  get<T>(table: string, key: string): Promise<T | undefined>;
  put<T>(table: string, key: string, row: T): Promise<void>;
  delete(table: string, key: string): Promise<void>;
  list<T>(table: string): Promise<T[]>;
}

export class MemoryStore implements Store {
  private readonly tables = new Map<string, Map<string, unknown>>();

  private bucket(table: string): Map<string, unknown> {
    let found = this.tables.get(table);
    if (!found) {
      found = new Map();
      this.tables.set(table, found);
    }
    return found;
  }

  async get<T>(table: string, key: string): Promise<T | undefined> {
    return this.bucket(table).get(key) as T | undefined;
  }

  async put<T>(table: string, key: string, row: T): Promise<void> {
    this.bucket(table).set(key, row);
  }

  async delete(table: string, key: string): Promise<void> {
    this.bucket(table).delete(key);
  }

  async list<T>(table: string): Promise<T[]> {
    return [...this.bucket(table).values()] as T[];
  }
}

export function holdingKey(seriesId: bigint, account: string): string {
  return `${seriesId.toString()}|${account.toLowerCase()}`;
}

export function pairKey(a: string, b: string): string {
  return `${a.toLowerCase()}|${b}`;
}
