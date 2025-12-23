import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { DepartmentService } from "./department.service";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiHttpErrorResponses, ApiHttpResponse } from "src/common/decorators/custom-decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Role } from "src/auth/enums/role.enums";
import { Roles } from "src/auth/decorators/roles.decorator";
import { Department } from "@prisma/client";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { HttpResponse } from "src/common/dto/http-response.dto";
import { IPaginationMeta } from "src/common/utils/pagination";
import { UpdateDepartmentDto } from "./dto/update-department.dto";

@ApiTags("Department")
@Controller({ path: "department", version: "1" })
export class DepartmentController {
    constructor(private readonly departmentService: DepartmentService) {}

    @ApiOperation({ summary: "Create a new department" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.CREATED)
    @ApiHttpResponse({ status: HttpStatus.CREATED, type: "Department", description: "Department created successfully" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DEPARTMENT_HEAD)
    @Post()
    async createDepartment(@Body() createDepartmentDto: CreateDepartmentDto): Promise<HttpResponse<Department>> {
        const department = await this.departmentService.createDepartment(createDepartmentDto);
        return new HttpResponse("Department created successfully", department, HttpStatus.CREATED);
    }

    @ApiOperation({ summary: "Get all departments" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.OK)
    @ApiHttpResponse({ status: HttpStatus.OK, type: "[Department]", description: "Departments retrieved successfully" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllDepartments(@Query() paginationDto: PaginationDto): Promise<HttpResponse<{ results: Department[]; meta: IPaginationMeta }>> {
        const departments = await this.departmentService.getAllDepartments(paginationDto);
        return new HttpResponse("Departments fetched successfully", departments, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Get a department by id" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.OK)
    @ApiHttpResponse({ status: HttpStatus.OK, type: String, description: "Department retrieved successfully" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get(":departmentId")
    async getDepartment(@Param("departmentId") departmentId: string): Promise<HttpResponse<Department>> {
        const department = await this.departmentService.getDepartment(departmentId);
        return new HttpResponse("Department fetched successfully", department, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Update a department by id" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.OK)
    @ApiHttpResponse({ status: HttpStatus.OK, type: String, description: "Department updated successfully" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DEPARTMENT_HEAD)
    @Patch(":departmentId")
    async updateDepartment(@Param("departmentId") departmentId: string, @Body() updateDepartmentDto: UpdateDepartmentDto): Promise<HttpResponse<Department>> {
        const department = await this.departmentService.updateDepartment(departmentId, updateDepartmentDto);
        return new HttpResponse("Department updated successfully", department, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Delete a department by id" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.OK)
    @ApiHttpResponse({ status: HttpStatus.OK, type: String, description: "Department deleted successfully" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DEPARTMENT_HEAD)
    @Delete(":departmentId")
    async deleteDepartment(@Param("departmentId") departmentId: string): Promise<HttpResponse<Department>> {
        const department = await this.departmentService.deleteDepartment(departmentId);
        return new HttpResponse("Department deleted successfully", department, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Assign user to department" })
    @ApiHttpErrorResponses()
    @HttpCode(HttpStatus.OK)
    @ApiHttpResponse({ status: HttpStatus.OK, type: String, description: "User assigned to department successfully" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DEPARTMENT_HEAD)
    @Patch(":departmentId/user/:userId")
    async assignUserToDepartment(@Param("departmentId") departmentId: string, @Param("userId") userId: string): Promise<HttpResponse<Department>> {
        const department = await this.departmentService.assignUserToDepartment(departmentId, userId);
        return new HttpResponse("User assigned to department successfully", department, HttpStatus.OK);
    }
}
