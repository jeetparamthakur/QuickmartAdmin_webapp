import type {
  ListFilters,
  PaginatedResult,
} from "@/lib/types";

export interface IRepository<T> {
  getAll(filters?: ListFilters): Promise<PaginatedResult<T>>;
  getById(id: string): Promise<T | null>;
}

export interface IWritableRepository<T> extends IRepository<T> {
  update(id: string, data: Partial<T>): Promise<T>;
  create(data: Omit<T, "id">): Promise<T>;
}
