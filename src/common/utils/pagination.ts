import { Prisma } from "@prisma/client";

export class PrismaPaginatorError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PrismaPaginatorError";
    }
}

type BaseModelDelegate<R> = {
    findMany: (args: IPaginateArgs) => Promise<R[]>;
    count: (args: Omit<IPaginateArgs, "skip" | "take" | "select" | "include" | "sort">) => Promise<number>;
};

export interface IPaginateArgs {
    where?: any;
    select?: any;
    include?: any;
    orderBy?: {
        [key: string]: Prisma.SortOrder;
    };
    skip?: number;
    take?: number;
}
export interface IPaginationMeta {
    total?: number;
    lastPage?: number;
    currentPage?: number;
    perPage?: number;
    prev?: number | null;
    next?: number | null;
}

export interface IPaginationResult<T> {
    data: T[];
    meta: IPaginationMeta;
}

export interface IPaginationOption {
    page: number;
    limit: number;
}

export interface IBasePaginator<T, D> {
    delegate: D;
    options: IPaginationOption;
    paginate(): Promise<IPaginationResult<T>>;
    getSkip(): number;
    setPage(page: number): this;
    setLimit(limit: number): this;
}

export class BasePaginator<T, D> implements IBasePaginator<T, D> {
    delegate: D;
    args: IPaginateArgs;
    options: IPaginationOption;
    constructor(delegate: D, options: IPaginationOption, args: IPaginateArgs) {
        this.args = args;
        this.options = options;
        this.delegate = delegate;
    }

    async paginate(): Promise<IPaginationResult<T>> {
        throw new PrismaPaginatorError("BasePaginator is an abstract class and cannot be instantiated directly");
    }

    getSkip(): number {
        return (this.options.page - 1) * this.options.limit;
    }

    setPage(page: number): this {
        this.options.page = page;
        return this;
    }

    setLimit(limit: number): this {
        this.options.limit = limit;
        return this;
    }
}

export class PageNumberPaginator<T, D extends BaseModelDelegate<T> = BaseModelDelegate<T>> extends BasePaginator<T, D> implements IBasePaginator<T, D> {
    constructor(delegate: D, options: IPaginationOption, args: IPaginateArgs) {
        super(delegate, options, args);
    }

    async paginate(): Promise<IPaginationResult<T>> {
        const skip = this.getSkip();
        const query = this.delegate.findMany({ where: this.args.where || {}, select: this.args.select ?? undefined, include: this.args.include ?? undefined, orderBy: this.args.orderBy || undefined, skip, take: this.options.limit });

        const [data, total] = await Promise.all([query, this.delegate.count({ where: this.args.where })]);

        const lastPage = Math.ceil(total / this.options.limit);
        const currentPage = this.options.page;

        return {
            data: data as T[],
            meta: {
                total,
                lastPage,
                currentPage,
                perPage: this.options.limit,
                prev: currentPage > 1 ? currentPage - 1 : null,
                next: currentPage < lastPage ? currentPage + 1 : null,
            },
        };
    }
}
