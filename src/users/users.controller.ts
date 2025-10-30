import { User } from "@prisma/client";
import { UpdatePasswordDto } from "./user.dto";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { HttpResponse } from "src/common/dto/http-response.dto";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request, Controller, Get, UseGuards, HttpStatus, Patch, Delete, Body, Query, Put, ParseFilePipeBuilder, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiHttpErrorResponses, ApiHttpResponse } from "src/common/decorators/custom-decorator";
import { IPaginationMeta } from "src/common/utils/pagination";
import { SUPPORTED_USER_IMAGE_FILE_SIZE, SUPPORTED_FILE_TYPES_FOR_USER_IMAGE } from "./user.constants";
import { FileInterceptor } from "@nestjs/platform-express";
import { UpdateProfileImageDto } from "./dto/update-profile-image.dto";
import { GetAllUserFilterDto } from "./dto/get-all-user-filter.dto";
import { UpdateUserProfileDto } from "./dto/update-user-profile.dto";

@ApiTags("Users")
@Controller({ path: "users", version: "1" })
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOperation({ summary: "Get User Session" })
    @ApiBearerAuth()
    @ApiHttpErrorResponses()
    @Get("session")
    @UseGuards(JwtAuthGuard)
    async getUserSession(@Request() req: Request & { user: User }): Promise<HttpResponse<User>> {
        const result = await this.usersService.getUserSession(req.user);
        return new HttpResponse("User session", result, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Get All Users" })
    @ApiBearerAuth()
    @ApiHttpErrorResponses()
    @Get("")
    @UseGuards(JwtAuthGuard)
    async getAllUsers(@Request() req: Request & { user: User }, @Query() paginationDto: PaginationDto, @Query() getAllUserFilterDto: GetAllUserFilterDto): Promise<HttpResponse<{ results: User[]; meta: IPaginationMeta }>> {
        const result = await this.usersService.getAllUsers(paginationDto, getAllUserFilterDto);
        return new HttpResponse("User session", result, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Update user Profile" })
    @ApiBearerAuth()
    @ApiHttpErrorResponses()
    @ApiHttpResponse({ status: 200, type: Boolean, description: "Update user Profile" })
    @Put("profile")
    @UseGuards(JwtAuthGuard)
    async updateUserProfile(@Request() req: Request & { user: User }, @Body() updateUserProfileDto: UpdateUserProfileDto): Promise<HttpResponse<User>> {
        const result = await this.usersService.updateUserProfile(req.user, updateUserProfileDto);
        return new HttpResponse("Update user Profile", result, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Update User Password" })
    @ApiBearerAuth()
    @ApiHttpErrorResponses()
    @ApiHttpResponse({ status: 200, type: Boolean, description: "Updates the user's password" })
    @Patch("update-password")
    @UseGuards(JwtAuthGuard)
    async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto, @Request() req: Request & { user: User }): Promise<HttpResponse<boolean>> {
        const result = await this.usersService.updatePassword(req.user, updatePasswordDto);
        return new HttpResponse("Password updated successfully", result, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Update Profile Image" })
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("profileImageFile"))
    @ApiBearerAuth()
    @ApiHttpErrorResponses()
    @ApiHttpResponse({ status: 200, type: Boolean, description: "Updates the user profile image" })
    @Patch("profile-image")
    @UseGuards(JwtAuthGuard)
    async updateProfileImage(
        @Body() updateProfileImageDto: UpdateProfileImageDto,
        @Request() req: Request & { user: User },
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: SUPPORTED_FILE_TYPES_FOR_USER_IMAGE.join("|"),
                })
                .addMaxSizeValidator({
                    maxSize: SUPPORTED_USER_IMAGE_FILE_SIZE,
                    message: "File size must be less than or equal to 30mb",
                })
                .build({ fileIsRequired: false, errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })
        )
        profileImageFile: Express.Multer.File
    ): Promise<HttpResponse<User>> {
        const result = await this.usersService.updateProfileImage(req.user, updateProfileImageDto, profileImageFile);
        return new HttpResponse("Profile Image Updated successfully", result, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Delete Profile Image" })
    @ApiBearerAuth()
    @ApiHttpErrorResponses()
    @ApiHttpResponse({ status: 200, type: Boolean, description: "Deletes the user profile image" })
    @Delete("profile-image")
    @UseGuards(JwtAuthGuard)
    async deleteProfileImage(@Request() req: Request & { user: User }): Promise<HttpResponse<void>> {
        const result = await this.usersService.deleteProfileImage(req.user);
        return new HttpResponse("Profile Image Delete successfully", result, HttpStatus.OK);
    }
}
