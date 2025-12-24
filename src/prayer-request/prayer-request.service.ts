import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreatePrayerRequestDto } from "./dto/create-prayer-request-dto";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { IPaginationMeta, PageNumberPaginator } from "src/common/utils/pagination";
import { PrayerRequest, Prisma } from "@prisma/client";
import { GetAllPrayerRequestsFilterDto } from "./dto/get-all-prayer-request-filter-dto";

@Injectable()
export class PrayerRequestService {
    constructor(private readonly prismaService: PrismaService) {}

    async getAllPrayerRequests(paginationDto: PaginationDto, getAllPrayerRequestFilterDto: GetAllPrayerRequestsFilterDto): Promise<{ results: PrayerRequest[]; meta: IPaginationMeta }> {
        const query: Prisma.PrayerRequestWhereInput = {};

        if (getAllPrayerRequestFilterDto.isAnswered !== undefined) {
            query.isAnswered = getAllPrayerRequestFilterDto.isAnswered;
        }

        const paginator = new PageNumberPaginator<PrayerRequest>(this.prismaService.prayerRequest, { page: paginationDto.page, limit: paginationDto.limit }, { where: query, orderBy: { createdAt: "desc" } });
        const { data: prayerRequests, meta } = await paginator.paginate();
        return { results: prayerRequests, meta };
    }

    async getPrayerRequest(prayerRequestId: string): Promise<PrayerRequest> {
        const prayerRequest = await this.prismaService.prayerRequest.findUnique({ where: { id: prayerRequestId } });
        if (!prayerRequest) throw new NotFoundException("Prayer Request not found");
        return prayerRequest;
    }

    async getUserPrayerRequests(userId: string): Promise<PrayerRequest[]> {
        const prayerRequests = await this.prismaService.prayerRequest.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
        return prayerRequests;
    }

    async createPrayerRequest(userId: string, createPrayerRequestDto: CreatePrayerRequestDto): Promise<PrayerRequest> {
        return await this.prismaService.prayerRequest.create({
            data: {
                title: createPrayerRequestDto.title,
                content: createPrayerRequestDto.content,
                userId,
            },
        });
    }

    async deletePrayerRequest(prayerRequestId: string): Promise<PrayerRequest> {
        const prayerRequest = await this.prismaService.prayerRequest.findUnique({ where: { id: prayerRequestId } });

        if (!prayerRequest) throw new NotFoundException("Prayer Request not found");

        return this.prismaService.prayerRequest.delete({ where: { id: prayerRequestId } });
    }

    async markPrayerRequestAsAnswered(prayerRequestId: string): Promise<PrayerRequest> {
        const prayerRequest = await this.prismaService.prayerRequest.findUnique({ where: { id: prayerRequestId } });

        if (!prayerRequest) throw new NotFoundException("Prayer Request not found");
        return this.prismaService.prayerRequest.update({ where: { id: prayerRequestId }, data: { isAnswered: true } });
    }
}
