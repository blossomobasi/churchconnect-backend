import { Body, Controller, HttpCode, HttpStatus, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
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
    // @Roles(Role.ADMIN, Role.DEPARTMENT_HEAD)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: "audio", maxCount: 1 },
            { name: "video", maxCount: 1 },
            { name: "thumbnail", maxCount: 1 },
        ])
    )
    @Post()
    async createSermon(
        @Req() req: Request & { user: User },
        @Body() createSermonDto: CreateSermonDto,
        @UploadedFiles()
        files: { audio?: Express.Multer.File[]; video?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] }
    ): Promise<HttpResponse<Sermon>> {
        // Validate audio file
        if (files.audio?.at(0)) {
            validateFile(files.audio.at(0) as Express.Multer.File, {
                allowedTypes: SUPPORTED_FILE_TYPES_FOR_SERMON_AUDIO,
                maxSize: MAX_FILE_SIZE_FOR_SERMON_AUDIO,
                label: "Audio",
            });
        }

        // Validate video file
        if (files.video?.at(0)) {
            validateFile(files.video.at(0) as Express.Multer.File, {
                allowedTypes: SUPPORTED_FILE_TYPES_FOR_SERMON_VIDEO,
                maxSize: MAX_FILE_SIZE_FOR_SERMON_VIDEO,
                label: "Video",
            });
        }

        // Validate thumbnail file
        if (files.thumbnail?.at(0)) {
            validateFile(files.thumbnail.at(0) as Express.Multer.File, {
                allowedTypes: SUPPORTED_FILE_TYPES_FOR_SERMON_THUMBNAIL,
                maxSize: MAX_FILE_SIZE_FOR_SERMON_THUMBNAIL,
                label: "Thumbnail",
            });
        }

        const userId = req.user.id;

        const sermon = await this.sermonService.createSermon(createSermonDto, files, userId as string);
        return new HttpResponse("Sermon created successfully", sermon, HttpStatus.CREATED);
    }
}
