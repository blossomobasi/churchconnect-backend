import bcryptjs from "bcryptjs";
import { ConfigService } from "@nestjs/config";
import { UpdatePasswordDto } from "./user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { Department, User } from "@prisma/client";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { IPaginationMeta, PageNumberPaginator } from "src/common/utils/pagination";
import { FileService } from "src/file/file.service";
import { UpdateProfileImageDto } from "./dto/update-profile-image.dto";
import { UpdateUserProfileDto } from "./dto/update-user-profile.dto";
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { GetAllUserFilterDto } from "./dto/get-all-user-filter.dto";
import { SafeUser, sanitizeUser } from "src/common/utils/sanitize-user";
import { Role } from "src/auth/enums/role.enums";
import { UpdateUserRoleDto } from "./dto/update-user-role.dto";

@Injectable()
export class UsersService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly fileService: FileService
    ) {}

    // User Retrieval Methods
    async getById(userId: string): Promise<SafeUser & { profileImageUrl: string | null; department: Department | null }> {
        const user = await this.prismaService.user.findUnique({ where: { id: userId }, include: { department: true } });
        const profileImageUrl = user?.profileImageId ? await this.fileService.getFileUrl({ fileId: user?.profileImageId, isSigned: true, useCloudFront: true }) : null;

        const sanitizedUser = sanitizeUser(user as User);

        return { ...sanitizedUser, profileImageUrl, department: user?.department as Department | null };
    }

    async getAllUsers(paginationDto: PaginationDto, getAllUserFilterDto: GetAllUserFilterDto): Promise<{ results: SafeUser[]; meta: IPaginationMeta }> {
        const query: Prisma.UserWhereInput = {};

        if (getAllUserFilterDto.name) {
            query.OR = [{ firstName: { contains: getAllUserFilterDto.name, mode: "insensitive" } }, { lastName: { contains: getAllUserFilterDto.name, mode: "insensitive" } }];
        }

        if (getAllUserFilterDto.email) {
            query.email = { contains: getAllUserFilterDto.email, mode: "insensitive" };
        }

        // if (getAllUserFilterDto.status) {
        //   query.status = getAllUserFilterDto.status;
        // }

        if (getAllUserFilterDto.dateFrom || getAllUserFilterDto.dateTo) {
            query.createdAt = {};

            if (getAllUserFilterDto.dateFrom) {
                query.createdAt.gte = new Date(getAllUserFilterDto.dateFrom);
            }

            if (getAllUserFilterDto.dateTo) {
                query.createdAt.lte = new Date(getAllUserFilterDto.dateTo);
            }
        }

        const paginator = new PageNumberPaginator<User>(this.prismaService.user, { page: paginationDto.page, limit: paginationDto.limit }, { where: query, orderBy: { createdAt: "desc" }, include: { department: true } });
        const { data: results, meta } = await paginator.paginate();

        const sanitizedResults = sanitizeUser(results);

        return { results: sanitizedResults, meta };
    }

    async getUserSession(user: User & { department: Department | null }): Promise<SafeUser & { profileImageUrl: string | null; department: Department | null }> {
        const profileImageUrl = user.profileImageId ? await this.fileService.getFileUrl({ fileId: user.profileImageId, isSigned: true, useCloudFront: true }) : null;

        const sanitizedUser = sanitizeUser(user);

        return { ...sanitizedUser, profileImageUrl, department: user.department };
    }

    async updateUserProfile(user: User, updateUserProfileDto: UpdateUserProfileDto): Promise<SafeUser> {
        const query: Prisma.UserUpdateInput = {};

        if (updateUserProfileDto.firstName) {
            query.firstName = updateUserProfileDto.firstName;
        }

        if (updateUserProfileDto.lastName) {
            query.lastName = updateUserProfileDto.lastName;
        }

        if (updateUserProfileDto.phone) {
            query.phone = updateUserProfileDto.phone;
        }

        if (updateUserProfileDto.address) {
            query.address = updateUserProfileDto.address;
        }

        const updatedUser = await this.prismaService.user.update({ where: { id: user.id }, data: query });

        const sanitizedUser = sanitizeUser(updatedUser);

        return sanitizedUser;
    }

    async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto): Promise<boolean> {
        const user = await this.prismaService.user.findUnique({ where: { id: userId }, select: { password: true } });

        if (!user) throw new NotFoundException("User not found");

        const isPasswordMatching = await bcryptjs.compare(updatePasswordDto.currentPassword, user.password as string);
        if (!isPasswordMatching) throw new UnauthorizedException("Current password is incorrect");

        const passwordHash = await bcryptjs.hash(updatePasswordDto.newPassword, this.configService.get<number>("CONFIGS.BCRYPT_SALT") as number);

        await this.prismaService.user.update({ where: { id: userId }, data: { password: passwordHash } });

        return true;
    }

    async updateProfileImage(user: User, updateProfileImageDto: UpdateProfileImageDto, profileImageFile: Express.Multer.File): Promise<User> {
        return this.prismaService.$transaction(async (tx) => {
            const file = await this.fileService.uploadFile({ file: profileImageFile, folder: "user/profile" });

            // Clean up old file if exists
            if (user.profileImageId) {
                await this.fileService.deleteFile({ fileId: user.profileImageId });
            }

            const updatedUser = await tx.user.update({
                where: { id: user.id },
                data: { profileImageId: file.id },
            });

            const profileImageUrl = updatedUser.profileImageId
                ? await this.fileService.getFileUrl({
                      fileId: updatedUser.profileImageId,
                      isSigned: true,
                      useCloudFront: true,
                  })
                : null;

            return { ...updatedUser, profileImageUrl };
        });
    }

    async deleteProfileImage(user: User): Promise<void> {
        return this.prismaService.$transaction(async () => {
            if (user.profileImageId) {
                await this.fileService.deleteFile({ fileId: user.profileImageId });
            }
        });
    }

    async updateUserRole(userId: string, updateUserRoleDto: UpdateUserRoleDto): Promise<SafeUser> {
        const user = await this.prismaService.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException("User not found");

        if (user.role === updateUserRoleDto.role) throw new BadRequestException("User role is already updated");
        if (updateUserRoleDto.role === Role.ADMIN) throw new BadRequestException("Cannot update user role to ADMIN");

        const result = await this.prismaService.user.update({ where: { id: userId }, data: { role: updateUserRoleDto.role } });

        return sanitizeUser(result);
    }
}
