import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateTestimonyDto } from "./dto/create-testimony.dto";
import { Prisma, Testimony, User } from "@prisma/client";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { IPaginationMeta, PageNumberPaginator } from "src/common/utils/pagination";
import { GetTestimonyFilterDto } from "./dto/get-testimony-filter.dto";

@Injectable()
export class TestimonyService {
    constructor(private readonly prismaService: PrismaService) {}

    async getTestimonies(getTestimonyFilterDto: GetTestimonyFilterDto, paginationDto: PaginationDto): Promise<{ results: Testimony[]; meta: IPaginationMeta }> {
        const query: Prisma.TestimonyWhereInput = {};

        if (getTestimonyFilterDto.isApproved) {
            query.isApproved = getTestimonyFilterDto.isApproved;
        }

        const paginator = new PageNumberPaginator<Testimony>(this.prismaService.testimony, { page: paginationDto.page, limit: paginationDto.limit }, { where: query, orderBy: { createdAt: "desc" } });
        const { data: testimonies, meta } = await paginator.paginate();
        return { results: testimonies, meta };
    }

    async getMyTestimonies(user: User, getTestimonyFilterDto: GetTestimonyFilterDto, paginationDto: PaginationDto): Promise<{ results: Testimony[]; meta: IPaginationMeta }> {
        const query: Prisma.TestimonyWhereInput = { userId: user.id };

        if (getTestimonyFilterDto.isApproved) {
            query.isApproved = getTestimonyFilterDto.isApproved;
        }

        const paginator = new PageNumberPaginator<Testimony>(this.prismaService.testimony, { page: paginationDto.page, limit: paginationDto.limit }, { where: query, orderBy: { createdAt: "desc" } });
        const { data: testimonies, meta } = await paginator.paginate();
        return { results: testimonies, meta };
    }

    async getTestimony(testimonyId: string): Promise<Testimony> {
        const testimony = await this.prismaService.testimony.findUnique({ where: { id: testimonyId } });

        if (!testimony) {
            throw new NotFoundException("Testimony not found");
        }

        return testimony;
    }

    async createTestimony(user: User, createTestimonyDto: CreateTestimonyDto): Promise<Testimony> {
        const testimony = await this.prismaService.testimony.create({ data: { ...createTestimonyDto, userId: user.id } });
        return testimony;
    }

    async deleteTestimony(testimonyId: string): Promise<Testimony> {
        const testimony = await this.prismaService.testimony.delete({ where: { id: testimonyId } });
        if (!testimony) {
            throw new NotFoundException("Testimony not found");
        }

        return testimony;
    }

    async deleteMyTestimony(user: User, testimonyId: string): Promise<Testimony> {
        const testimony = await this.prismaService.testimony.delete({ where: { id: testimonyId, userId: user.id } });
        if (!testimony) {
            throw new NotFoundException("Testimony not found");
        }

        return testimony;
    }

    async approveTestimony(testimonyId: string): Promise<Testimony> {
        const updatedTestimony = await this.prismaService.testimony.update({ where: { id: testimonyId }, data: { isApproved: true } });
        if (!updatedTestimony) {
            throw new NotFoundException("Testimony not found");
        }
        return updatedTestimony;
    }
}
