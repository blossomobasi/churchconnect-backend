import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { PrayerRequestService } from "./prayer-request.service";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiHttpErrorResponses, ApiHttpResponse } from "src/common/decorators/custom-decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { HttpResponse } from "src/common/dto/http-response.dto";
import { PrayerRequest, User } from "@prisma/client";
import { IPaginationMeta } from "src/common/utils/pagination";
import { CreatePrayerRequestDto } from "./dto/create-prayer-request-dto";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { Role } from "src/auth/enums/role.enums";
import { GetAllPrayerRequestsFilterDto } from "./dto/get-all-prayer-request-filter-dto";

@ApiTags("Prayer Requests")
@Controller({ path: "prayer-request", version: "1" })
export class PrayerRequestController {
    constructor(private readonly prayerRequestService: PrayerRequestService) {}

    @ApiOperation({ summary: "Create prayer request" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.CREATED)
    @ApiHttpResponse({ status: HttpStatus.CREATED, type: "PrayerRequest" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post()
    async createPrayerRequest(@Req() req: Request & { user: User }, @Body() createPrayerRequestDto: CreatePrayerRequestDto): Promise<HttpResponse<PrayerRequest>> {
        const prayerRequest = await this.prayerRequestService.createPrayerRequest(req.user.id, createPrayerRequestDto);
        return new HttpResponse("Prayer request created successfully", prayerRequest, HttpStatus.CREATED);
    }

    @ApiOperation({ summary: "Get all prayer requests" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.OK)
    @ApiHttpResponse({ status: HttpStatus.OK, type: "PrayerRequest", isArray: true })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllPrayerRequests(@Query() paginationDto: PaginationDto, @Query() getAllPrayerRequestFilterDto: GetAllPrayerRequestsFilterDto): Promise<HttpResponse<{ results: PrayerRequest[]; meta: IPaginationMeta }>> {
        const prayerRequests = await this.prayerRequestService.getAllPrayerRequests(paginationDto, getAllPrayerRequestFilterDto);
        return new HttpResponse("Prayer requests fetched successfully", prayerRequests, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Get prayer request" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.OK)
    @ApiHttpResponse({ status: HttpStatus.OK, type: "PrayerRequest" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("/:prayerRequestId")
    async getPrayerRequest(@Param("prayerRequestId") prayerRequestId: string): Promise<HttpResponse<PrayerRequest>> {
        const prayerRequest = await this.prayerRequestService.getPrayerRequest(prayerRequestId);
        return new HttpResponse("Prayer request fetched successfully", prayerRequest, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Get user prayer requests" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.OK)
    @ApiHttpResponse({ status: HttpStatus.OK, type: "PrayerRequest", isArray: true })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("/my-prayer-requests")
    async getUserPrayerRequests(@Req() req: Request & { user: User }): Promise<HttpResponse<PrayerRequest[]>> {
        const prayerRequests = await this.prayerRequestService.getUserPrayerRequests(req.user.id);
        return new HttpResponse("Prayer requests fetched successfully", prayerRequests, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Delete prayer request" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.OK)
    @ApiHttpResponse({ status: HttpStatus.OK, type: "PrayerRequest" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete("/:prayerRequestId")
    async deletePrayerRequest(@Param("prayerRequestId") prayerRequestId: string): Promise<HttpResponse<PrayerRequest>> {
        const prayerRequest = await this.prayerRequestService.deletePrayerRequest(prayerRequestId);
        return new HttpResponse("Prayer request deleted successfully", prayerRequest, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Mark prayer request as answered" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.OK)
    @ApiHttpResponse({ status: HttpStatus.OK, type: "PrayerRequest" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DEPARTMENT_HEAD)
    @Patch("/:prayerRequestId/mark-as-answered")
    async markPrayerRequestAsAnswered(@Param("prayerRequestId") prayerRequestId: string): Promise<HttpResponse<PrayerRequest>> {
        const prayerRequest = await this.prayerRequestService.markPrayerRequestAsAnswered(prayerRequestId);
        return new HttpResponse("Prayer request marked as answered successfully", prayerRequest, HttpStatus.OK);
    }
}
