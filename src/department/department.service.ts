import { Injectable, NotFoundException } from "@nestjs/common";
import { Department } from "@prisma/client";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { IPaginationMeta, PageNumberPaginator } from "src/common/utils/pagination";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";

@Injectable()
export class DepartmentService {
    constructor(private readonly prismaService: PrismaService) {}

    async getDepartment(departmentId: string): Promise<Department> {
        const department = await this.prismaService.department.findUnique({ where: { id: departmentId } });

        if (!department) {
            throw new NotFoundException("Department not found");
        }

        return department;
    }

    async getAllDepartments(paginationDto: PaginationDto): Promise<{ results: Department[]; meta: IPaginationMeta }> {
        const paginator = new PageNumberPaginator<Department>(this.prismaService.department, { page: paginationDto.page, limit: paginationDto.limit }, { orderBy: { createdAt: "desc" }, include: { members: true } });

        const { data: departments, meta } = await paginator.paginate();

        return { results: departments, meta };
    }

    async createDepartment(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
        return this.prismaService.department.create({ data: createDepartmentDto });
    }

    async updateDepartment(departmentId: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
        const department = await this.prismaService.department.findUnique({ where: { id: departmentId } });

        if (!department) {
            throw new NotFoundException("Department not found");
        }

        return this.prismaService.department.update({ where: { id: departmentId }, data: updateDepartmentDto });
    }

    async deleteDepartment(departmentId: string): Promise<Department> {
        const department = await this.prismaService.department.findUnique({ where: { id: departmentId } });

        if (!department) {
            throw new NotFoundException("Department not found");
        }

        return this.prismaService.department.delete({ where: { id: departmentId } });
    }

    async getUsersAssignedToDepartment(departmentId: string): Promise<Department> {
        const department = await this.prismaService.department.findUnique({ where: { id: departmentId }, include: { members: true } });

        if (!department) {
            throw new NotFoundException("Department not found");
        }

        return department;
    }

    async assignUserToDepartment(departmentId: string, userId: string): Promise<Department> {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            select: { id: true, departmentId: true },
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        const department = await this.getDepartment(departmentId);

        // Update user's departmentId
        await this.prismaService.user.update({
            where: { id: userId },
            data: { departmentId: department.id },
        });

        // Return the department with members (we know it exists, so use non-null assertion)
        const updatedDepartment = await this.prismaService.department.findUnique({
            where: { id: department.id },
            include: { members: true },
        });

        return updatedDepartment!;
    }

    async removeUserFromDepartment(departmentId: string, userId: string): Promise<Department> {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            select: { id: true, departmentId: true },
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        const department = await this.getDepartment(departmentId);

        // Update user's departmentId
        await this.prismaService.user.update({
            where: { id: userId },
            data: { departmentId: null },
        });
        return department;
    }
}
