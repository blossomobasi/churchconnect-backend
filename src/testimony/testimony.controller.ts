import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { TestimonyService } from "./testimony.service";
import { GetTestimonyFilterDto } from "./dto/get-testimony-filter.dto";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Testimony, User } from "@prisma/client";
import { IPaginationMeta } from "src/common/utils/pagination";
import { ApiHttpErrorResponses, ApiHttpResponse } from "src/common/decorators/custom-decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { CreateTestimonyDto } from "./dto/create-testimony.dto";
import { HttpResponse } from "src/common/dto/http-response.dto";
import { Roles } from "src/auth/decorators/roles.decorator";
import { Role } from "src/auth/enums/role.enums";
import { RolesGuard } from "src/auth/guards/roles.guard";

@ApiTags("Testimony")
@Controller({ path: "testimony", version: "1" })
export class TestimonyController {
    constructor(private readonly testimonyService: TestimonyService) {}

    @ApiOperation({ summary: "Create testimony" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.CREATED)
    @ApiHttpResponse({ status: HttpStatus.CREATED, type: "Testimony" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post()
    async createTestimony(@Req() req: Request & { user: User }, @Body() createTestimonyDto: CreateTestimonyDto): Promise<HttpResponse<Testimony>> {
        const testimony = await this.testimonyService.createTestimony(req.user, createTestimonyDto);
        return new HttpResponse("Testimony created successfully", testimony, HttpStatus.CREATED);
    }

    @ApiOperation({ summary: "Get all testimonies" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.OK)
    @ApiHttpResponse({ status: HttpStatus.OK, type: Object, isArray: true })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get()
    async getTestimonies(@Query() getTestimonyFilterDto: GetTestimonyFilterDto, @Query() paginationDto: PaginationDto): Promise<HttpResponse<{ results: Testimony[]; meta: IPaginationMeta }>> {
        const testimonies = await this.testimonyService.getTestimonies(getTestimonyFilterDto, paginationDto);
        return new HttpResponse("Testimonies fetched successfully", testimonies, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Get my testimonies" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.OK)
    @ApiHttpResponse({ status: HttpStatus.OK, type: Object, isArray: true })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("me")
    async getMyTestimonies(@Req() req: Request & { user: User }, @Query() getTestimonyFilterDto: GetTestimonyFilterDto, @Query() paginationDto: PaginationDto): Promise<HttpResponse<{ results: Testimony[]; meta: IPaginationMeta }>> {
        const testimonies = await this.testimonyService.getMyTestimonies(req.user, getTestimonyFilterDto, paginationDto);
        return new HttpResponse("Testimonies fetched successfully", testimonies, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Get testimony by id" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.OK)
    @ApiHttpResponse({ status: HttpStatus.OK, type: "Testimony" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get(":testimonyId")
    async getTestimony(@Param("testimonyId") testimonyId: string): Promise<HttpResponse<Testimony>> {
        const testimony = await this.testimonyService.getTestimony(testimonyId);
        return new HttpResponse("Testimony fetched successfully", testimony, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Approve testimony by id" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.OK)
    @ApiHttpResponse({ status: HttpStatus.OK, type: "Testimony" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DEPARTMENT_HEAD)
    @Patch(":testimonyId/approve")
    async approveTestimony(@Param("testimonyId") testimonyId: string): Promise<HttpResponse<Testimony>> {
        const testimony = await this.testimonyService.approveTestimony(testimonyId);
        return new HttpResponse("Testimony approved successfully", testimony, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Delete testimony by id" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.OK)
    @ApiHttpResponse({ status: HttpStatus.OK, type: "Testimony" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DEPARTMENT_HEAD)
    @Delete(":testimonyId")
    async deleteTestimony(@Param("testimonyId") testimonyId: string): Promise<HttpResponse<Testimony>> {
        const testimony = await this.testimonyService.deleteTestimony(testimonyId);
        return new HttpResponse("Testimony deleted successfully", testimony, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Delete my testimony by id" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.OK)
    @ApiHttpResponse({ status: HttpStatus.OK, type: "Testimony" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete(":testimonyId/me")
    async deleteMyTestimony(@Req() req: Request & { user: User }, @Param("testimonyId") testimonyId: string): Promise<HttpResponse<Testimony>> {
        const testimony = await this.testimonyService.deleteMyTestimony(req.user, testimonyId);
        return new HttpResponse("Testimony deleted successfully", testimony, HttpStatus.OK);
    }
}
