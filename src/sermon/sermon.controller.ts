import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SermonService } from "./sermon.service";
import { ApiHttpErrorResponses, ApiHttpResponse } from "src/common/decorators/custom-decorator";
import { CreateSermonDto } from "./dto/create-sermon-dto";
import { HttpResponse } from "src/common/dto/http-response.dto";
import { Sermon } from "@prisma/client";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { Role } from "src/auth/enums/role.enums";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { MAX_FILE_SIZE_FOR_SERMON_AUDIO, MAX_FILE_SIZE_FOR_SERMON_THUMBNAIL, MAX_FILE_SIZE_FOR_SERMON_VIDEO, SUPPORTED_FILE_TYPES_FOR_SERMON_AUDIO, SUPPORTED_FILE_TYPES_FOR_SERMON_THUMBNAIL, SUPPORTED_FILE_TYPES_FOR_SERMON_VIDEO } from "./sermon.constants";
import { User } from "@sentry/nestjs";
import { validateFile } from "src/common/validators/file.validator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { GetAllSermonFilterDto } from "./dto/get-all-sermon-filter-dto";
import { IPaginationMeta } from "src/common/utils/pagination";
import { UpdateSermonDto } from "./dto/update-sermon-dto";

@ApiTags("Sermons")
@Controller({ path: "sermons", version: "1" })
export class SermonController {
    constructor(private readonly sermonService: SermonService) {}

    @ApiOperation({ summary: "Create a new sermon" })
    @ApiConsumes("multipart/form-data")
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.CREATED)
    @ApiHttpResponse({ status: HttpStatus.CREATED, type: CreateSermonDto, description: "Sermon created successfully" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DEPARTMENT_HEAD)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: "audioFile", maxCount: 1 },
            { name: "videoFile", maxCount: 1 },
            { name: "thumbnailFile", maxCount: 1 },
        ])
    )
    @Post()
    async createSermon(
        @Req() req: Request & { user: User },
        @Body() createSermonDto: CreateSermonDto,
        @UploadedFiles()
        files: { audioFile?: Express.Multer.File[]; videoFile?: Express.Multer.File[]; thumbnailFile?: Express.Multer.File[] }
    ): Promise<HttpResponse<Sermon>> {
        // Validate audio file
        if (files.audioFile?.at(0)) {
            validateFile(files.audioFile.at(0) as Express.Multer.File, {
                allowedTypes: SUPPORTED_FILE_TYPES_FOR_SERMON_AUDIO,
                maxSize: MAX_FILE_SIZE_FOR_SERMON_AUDIO,
                label: "Audio",
            });
        }

        // Validate video file
        if (files.videoFile?.at(0)) {
            validateFile(files.videoFile.at(0) as Express.Multer.File, {
                allowedTypes: SUPPORTED_FILE_TYPES_FOR_SERMON_VIDEO,
                maxSize: MAX_FILE_SIZE_FOR_SERMON_VIDEO,
                label: "Video",
            });
        }

        // Validate thumbnail file
        if (files.thumbnailFile?.at(0)) {
            validateFile(files.thumbnailFile.at(0) as Express.Multer.File, {
                allowedTypes: SUPPORTED_FILE_TYPES_FOR_SERMON_THUMBNAIL,
                maxSize: MAX_FILE_SIZE_FOR_SERMON_THUMBNAIL,
                label: "Thumbnail",
            });
        }

        const userId = req.user.id;

        const sermon = await this.sermonService.createSermon(createSermonDto, { audio: files.audioFile, video: files.videoFile, thumbnail: files.thumbnailFile }, userId as string);
        return new HttpResponse("Sermon created successfully", sermon, HttpStatus.CREATED);
    }

    @ApiOperation({ summary: "Get all sermons" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.OK)
    @ApiHttpResponse({ status: HttpStatus.OK, type: CreateSermonDto, description: "Sermons fetched successfully" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get()
    async getSermons(@Query() PaginationDto: PaginationDto, @Query() getAllSermonFilterDto: GetAllSermonFilterDto): Promise<HttpResponse<{ results: Sermon[]; meta: IPaginationMeta }>> {
        const sermons = await this.sermonService.getAllSermons(PaginationDto, getAllSermonFilterDto);
        return new HttpResponse("Sermons fetched successfully", sermons, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Get sermon by ID" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.OK)
    @ApiHttpResponse({ status: HttpStatus.OK, type: CreateSermonDto, description: "Sermon fetched successfully" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get(":sermonId")
    async getSermonById(@Param("sermonId") sermonId: string): Promise<HttpResponse<Sermon>> {
        const sermon = await this.sermonService.getSermonById(sermonId);
        return new HttpResponse("Sermon fetched successfully", sermon, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Update sermon by ID" })
    @ApiConsumes("multipart/form-data")
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.OK)
    @ApiHttpResponse({ status: HttpStatus.OK, type: CreateSermonDto, description: "Sermon updated successfully" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DEPARTMENT_HEAD)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: "audioFile", maxCount: 1 },
            { name: "videoFile", maxCount: 1 },
            { name: "thumbnailFile", maxCount: 1 },
        ])
    )
    @Patch(":sermonId")
    async updateSermonById(@Param("sermonId") sermonId: string, @Body() updateSermonDto: UpdateSermonDto, @UploadedFiles() files: { audioFile?: Express.Multer.File[]; videoFile?: Express.Multer.File[]; thumbnailFile?: Express.Multer.File[] }): Promise<HttpResponse<Sermon>> {
        const sermon = await this.sermonService.updateSermon(sermonId, updateSermonDto, { audio: files.audioFile, video: files.videoFile, thumbnail: files.thumbnailFile });
        return new HttpResponse("Sermon updated successfully", sermon, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Delete sermon by ID" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.OK)
    @ApiHttpResponse({ status: HttpStatus.OK, type: Boolean, description: "Delete sermon description" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DEPARTMENT_HEAD)
    @Delete(":sermonId")
    async deleteSermonById(@Param("sermonId") sermonId: string): Promise<HttpResponse<void>> {
        const sermon = await this.sermonService.deleteSermon(sermonId);
        return new HttpResponse("Sermon deleted successfully", sermon, HttpStatus.NO_CONTENT);
    }
}
