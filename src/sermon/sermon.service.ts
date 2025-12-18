import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateSermonDto } from "./dto/create-sermon-dto";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma, Sermon } from "@prisma/client";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { GetAllSermonFilterDto } from "./dto/get-all-sermon-filter-dto";
import { IPaginationMeta, PageNumberPaginator } from "src/common/utils/pagination";
import { FileService } from "src/file/file.service";

@Injectable()
export class SermonService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly fileService: FileService
    ) {}

    async getSermonById(sermonId: string): Promise<Sermon> {
        const sermon = await this.prismaService.sermon.findUnique({ where: { id: sermonId } });

        if (!sermon) {
            throw new NotFoundException("Sermon not found");
        }

        return sermon;
    }

    async getAllSermons(paginationDto: PaginationDto, getAllSermonFilterDto: GetAllSermonFilterDto): Promise<{ results: Sermon[]; meta: IPaginationMeta }> {
        const query: Prisma.SermonWhereInput = {};

        if (getAllSermonFilterDto.preacher) {
            query.preacher = { contains: getAllSermonFilterDto.preacher, mode: "insensitive" };
        }

        if (getAllSermonFilterDto.title) {
            query.title = { contains: getAllSermonFilterDto.title, mode: "insensitive" };
        }

        if (getAllSermonFilterDto.datePreached) {
            query.datePreached = { equals: getAllSermonFilterDto.datePreached };
        }

        const paginator = new PageNumberPaginator<Sermon>(this.prismaService.sermon, { page: paginationDto.page, limit: paginationDto.limit }, { where: query, orderBy: { datePreached: "desc" } });

        const { data: results, meta } = await paginator.paginate();

        return { results, meta };
    }

    async createSermon(createSermonDto: CreateSermonDto, files: { audio?: Express.Multer.File[]; video?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] }, userId: string): Promise<Sermon> {
        // upload files and get File records
        let audioFile = null;
        let videoFile = null;
        let thumbnailFile = null;

        if (files.audio?.at(0)) {
            audioFile = await this.fileService.uploadFile({ file: files.audio.at(0) as Express.Multer.File, folder: "sermons/audios" });
        }

        if (files.video?.at(0)) {
            videoFile = await this.fileService.uploadFile({ file: files.video.at(0) as Express.Multer.File, folder: "sermons/videos" });
        }

        if (files.thumbnail?.at(0)) {
            thumbnailFile = await this.fileService.uploadFile({ file: files.thumbnail.at(0) as Express.Multer.File, folder: "sermons/thumbnails" });
        }

        return this.prismaService.sermon.create({
            data: {
                title: createSermonDto.title,
                description: createSermonDto.description,
                preacher: createSermonDto.preacher,
                datePreached: new Date(createSermonDto.datePreached),
                scriptureText: createSermonDto.scriptureText,
                audioFileId: audioFile?.id,
                videoFileId: videoFile?.id,
                thumbnailFileId: thumbnailFile?.id,
                uploadedById: userId,
            },
            include: {
                audioFile: true,
                videoFile: true,
                thumbnailFile: true,
                uploadedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
    }
}
