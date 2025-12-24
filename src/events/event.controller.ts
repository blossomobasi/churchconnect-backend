import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { EventService } from "./event.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { GetAllEventsFilterDto } from "./dto/get-all-events-filter.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../auth/enums/role.enums";
import { HttpResponse } from "../common/dto/http-response.dto";
import { User } from "@prisma/client";
import { ApiHttpErrorResponses } from "../common/decorators/custom-decorator";

@ApiTags("Events")
@Controller({ path: "events", version: "1" })
export class EventController {
    constructor(private readonly eventService: EventService) {}

    @ApiOperation({ summary: "Create event (Admin/Dept Head only)" })
    @ApiConsumes("multipart/form-data")
    @ApiHttpErrorResponses()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DEPARTMENT_HEAD)
    @UseInterceptors(FileInterceptor("image"))
    @Post()
    async createEvent(@Req() req: Request & { user: User }, @Body() createEventDto: CreateEventDto, @UploadedFile() image?: Express.Multer.File): Promise<HttpResponse<any>> {
        const event = await this.eventService.createEvent(createEventDto, image, req.user.id);
        return new HttpResponse("Event created successfully", event, HttpStatus.CREATED);
    }

    @ApiOperation({ summary: "Get all events" })
    @ApiHttpErrorResponses()
    @Get()
    async getAllEvents(@Query() paginationDto: PaginationDto, @Query() filterDto: GetAllEventsFilterDto): Promise<HttpResponse<any>> {
        const result = await this.eventService.getAllEvents(paginationDto, filterDto);
        return new HttpResponse("Events fetched successfully", result, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Get event by ID" })
    @ApiHttpErrorResponses()
    @Get(":eventId")
    async getEventById(@Param("eventId") eventId: string): Promise<HttpResponse<any>> {
        const event = await this.eventService.getEventById(eventId);
        return new HttpResponse("Event fetched successfully", event, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Update event" })
    @ApiConsumes("multipart/form-data")
    @ApiHttpErrorResponses()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DEPARTMENT_HEAD)
    @UseInterceptors(FileInterceptor("image"))
    @Patch(":eventId")
    async updateEvent(@Param("eventId") eventId: string, @Body() updateEventDto: UpdateEventDto, @UploadedFile() image?: Express.Multer.File): Promise<HttpResponse<any>> {
        const event = await this.eventService.updateEvent(eventId, updateEventDto, image);
        return new HttpResponse("Event updated successfully", event, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Delete event" })
    @ApiHttpErrorResponses()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(":eventId")
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteEvent(@Param("eventId") eventId: string): Promise<void> {
        await this.eventService.deleteEvent(eventId);
    }

    @ApiOperation({ summary: "Register for event" })
    @ApiHttpErrorResponses()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post(":eventId/register")
    async registerForEvent(@Param("eventId") eventId: string, @Req() req: Request & { user: User }): Promise<HttpResponse<any>> {
        const registration = await this.eventService.registerForEvent(eventId, req.user.id);
        return new HttpResponse("Registered successfully", registration, HttpStatus.CREATED);
    }

    @ApiOperation({ summary: "Cancel event registration" })
    @ApiHttpErrorResponses()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete(":eventId/register")
    @HttpCode(HttpStatus.NO_CONTENT)
    async cancelRegistration(@Param("eventId") eventId: string, @Req() req: Request & { user: User }): Promise<void> {
        await this.eventService.cancelRegistration(eventId, req.user.id);
    }

    @ApiOperation({ summary: "Get my event registrations" })
    @ApiHttpErrorResponses()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("my/registrations")
    async getUserRegistrations(@Req() req: Request & { user: User }): Promise<HttpResponse<any>> {
        const registrations = await this.eventService.getUserRegistrations(req.user.id);
        return new HttpResponse("Registrations fetched successfully", registrations, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Get event registrations (Admin/Dept Head)" })
    @ApiHttpErrorResponses()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DEPARTMENT_HEAD)
    @Get(":eventId/registrations")
    async getEventRegistrations(@Param("eventId") eventId: string): Promise<HttpResponse<any>> {
        const registrations = await this.eventService.getEventRegistrations(eventId);
        return new HttpResponse("Registrations fetched successfully", registrations, HttpStatus.OK);
    }
}
