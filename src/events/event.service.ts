// src/events/event.service.ts
import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { FileService } from "../file/file.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { GetAllEventsFilterDto } from "./dto/get-all-events-filter.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { IPaginationMeta, PageNumberPaginator } from "../common/utils/pagination";
import { Event, Prisma } from "@prisma/client";

@Injectable()
export class EventService {
    constructor(
        private prismaService: PrismaService,
        private fileService: FileService
    ) {}

    async createEvent(createEventDto: CreateEventDto, image: Express.Multer.File | undefined, userId: string): Promise<Event> {
        // Validate dates
        const start = new Date(createEventDto.startDateTime);
        const end = new Date(createEventDto.endDateTime);

        if (start >= end) {
            throw new BadRequestException("End date must be after start date");
        }

        // Upload image if provided
        let imageFile = null;
        if (image) {
            imageFile = await this.fileService.uploadFile({
                file: image,
                folder: "events/images",
            });
        }

        return this.prismaService.event.create({
            data: {
                title: createEventDto.title,
                description: createEventDto.description,
                tags: createEventDto.tags,
                startDateTime: start,
                endDateTime: end,
                location: createEventDto.location,
                isVirtual: createEventDto.isVirtual || false,
                virtualMeetingLink: createEventDto.virtualMeetingLink,
                capacity: createEventDto.capacity || null,
                imageFileId: imageFile?.id,
                createdById: userId,
            },
            include: {
                imageFile: true,
                createdBy: {
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

    async getAllEvents(paginationDto: PaginationDto, getAllEventFilterDto: GetAllEventsFilterDto): Promise<{ results: Event[]; meta: IPaginationMeta }> {
        const query: Prisma.EventWhereInput = {};

        if (getAllEventFilterDto.eventTitle) {
            query.title = { contains: getAllEventFilterDto.eventTitle, mode: "insensitive" };
        }

        if (getAllEventFilterDto.startDate) {
            query.startDateTime = { gte: getAllEventFilterDto.startDate };
        }

        if (getAllEventFilterDto.endDate) {
            query.endDateTime = { lte: getAllEventFilterDto.endDate };
        }

        if (getAllEventFilterDto.startDate || getAllEventFilterDto.endDate) {
            query.startDateTime = {};
            if (getAllEventFilterDto.startDate) {
                query.startDateTime.gte = new Date(getAllEventFilterDto.startDate);
            }
            if (getAllEventFilterDto.endDate) {
                query.startDateTime.lte = new Date(getAllEventFilterDto.endDate);
            }
        }

        const paginator = new PageNumberPaginator<Event>(
            this.prismaService.event,
            { page: paginationDto.page, limit: paginationDto.limit },
            {
                where: query,
                orderBy: { startDateTime: "asc" },
                include: {
                    imageFile: true,
                    createdBy: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    _count: {
                        select: { registrations: true },
                    },
                },
            }
        );

        const { data: events, meta } = await paginator.paginate();
        return { results: events, meta };
    }

    async getEventById(eventId: string): Promise<Event & { eventImageUrl: string | null }> {
        const event = await this.prismaService.event.findUnique({
            where: { id: eventId },
            include: {
                imageFile: true,
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                registrations: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                _count: {
                    select: { registrations: true },
                },
            },
        });

        if (!event) {
            throw new NotFoundException("Event not found");
        }

        const eventImageUrl = event?.imageFileId ? await this.fileService.getFileUrl({ fileId: event?.imageFileId, isSigned: true, useCloudFront: true }) : null;

        return { ...event, eventImageUrl };
    }

    async updateEvent(eventId: string, updateEventDto: UpdateEventDto, image: Express.Multer.File | undefined): Promise<Event> {
        const event = await this.prismaService.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            throw new NotFoundException("Event not found");
        }

        const updateData: Prisma.EventUpdateInput = {};

        if (updateEventDto.title) updateData.title = updateEventDto.title;
        if (updateEventDto.description !== undefined) updateData.description = updateEventDto.description;
        if (updateEventDto.tags) updateData.tags = updateEventDto.tags;
        if (updateEventDto.startDateTime) updateData.startDateTime = new Date(updateEventDto.startDateTime);
        if (updateEventDto.endDateTime) updateData.endDateTime = new Date(updateEventDto.endDateTime);
        if (updateEventDto.location !== undefined) updateData.location = updateEventDto.location;
        if (updateEventDto.isVirtual !== undefined) updateData.isVirtual = updateEventDto.isVirtual;
        if (updateEventDto.virtualMeetingLink !== undefined) updateData.virtualMeetingLink = updateEventDto.virtualMeetingLink;
        if (updateEventDto.capacity !== undefined) updateData.capacity = updateEventDto.capacity;

        // Handle image update
        if (image) {
            if (event.imageFileId) {
                await this.fileService.deleteFile({ fileId: event.imageFileId });
            }
            const imageFile = await this.fileService.uploadFile({
                file: image,
                folder: "events/images",
            });
            updateData.imageFile = { connect: { id: imageFile.id } };
        }

        return this.prismaService.event.update({
            where: { id: eventId },
            data: updateData,
            include: {
                imageFile: true,
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    }

    async deleteEvent(eventId: string): Promise<void> {
        const event = await this.prismaService.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            throw new NotFoundException("Event not found");
        }

        // Delete image if exists
        if (event.imageFileId) {
            await this.fileService.deleteFile({ fileId: event.imageFileId });
        }

        await this.prismaService.event.delete({
            where: { id: eventId },
        });
    }

    async registerForEvent(eventId: string, userId: string) {
        const event = await this.prismaService.event.findUnique({
            where: { id: eventId },
            include: {
                _count: {
                    select: { registrations: true },
                },
            },
        });

        if (!event) {
            throw new NotFoundException("Event not found");
        }

        // Check if event has passed
        if (new Date() > event.startDateTime) {
            throw new BadRequestException("Cannot register for past events");
        }

        // Check capacity
        if (event.capacity && event._count.registrations >= event.capacity) {
            throw new BadRequestException("Event is full");
        }

        // Check if already registered
        const existing = await this.prismaService.eventRegistration.findUnique({
            where: {
                eventId_userId: {
                    eventId,
                    userId,
                },
            },
        });

        if (existing) {
            throw new BadRequestException("Already registered for this event");
        }

        return this.prismaService.eventRegistration.create({
            data: {
                eventId,
                userId,
            },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        startDateTime: true,
                    },
                },
            },
        });
    }

    async cancelRegistration(eventId: string, userId: string) {
        const registration = await this.prismaService.eventRegistration.findUnique({
            where: {
                eventId_userId: {
                    eventId,
                    userId,
                },
            },
        });

        if (!registration) {
            throw new NotFoundException("Registration not found");
        }

        await this.prismaService.eventRegistration.delete({
            where: {
                eventId_userId: {
                    eventId,
                    userId,
                },
            },
        });
    }

    async getUserRegistrations(userId: string) {
        return this.prismaService.eventRegistration.findMany({
            where: { userId },
            include: {
                event: {
                    include: {
                        imageFile: true,
                        _count: {
                            select: { registrations: true },
                        },
                    },
                },
            },
            orderBy: {
                event: {
                    startDateTime: "asc",
                },
            },
        });
    }

    async getEventRegistrations(eventId: string) {
        return this.prismaService.eventRegistration.findMany({
            where: { eventId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: {
                registeredAt: "desc",
            },
        });
    }
}
