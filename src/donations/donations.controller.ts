import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DonationsService } from "./donations.service";
import { CreateDonationDto } from "./dto/create-donation.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../auth/enums/role.enums";
import { HttpResponse } from "../common/dto/http-response.dto";
import { User } from "@prisma/client";
import { ApiHttpErrorResponses } from "../common/decorators/custom-decorator";

@ApiTags("Donations")
@Controller({ path: "donations", version: "1" })
export class DonationsController {
    constructor(private readonly donationsService: DonationsService) {}

    @ApiOperation({ summary: "Initialize donation payment" })
    @ApiHttpErrorResponses()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post("initialize")
    async initializeDonation(@Req() req: Request & { user: User }, @Body() createDonationDto: CreateDonationDto): Promise<HttpResponse<any>> {
        const result = await this.donationsService.initializeDonation(req.user.id, req.user.email, createDonationDto);
        return new HttpResponse("Payment initialized. Redirect user to authorization_url", result, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Verify donation payment" })
    @ApiHttpErrorResponses()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("verify/:reference")
    async verifyDonation(@Param("reference") reference: string): Promise<HttpResponse<any>> {
        const result = await this.donationsService.verifyDonation(reference);
        return new HttpResponse("Payment verified successfully", result, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Get my donations" })
    @ApiHttpErrorResponses()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("my-donations")
    async getUserDonations(@Req() req: Request & { user: User }): Promise<HttpResponse<any>> {
        const donations = await this.donationsService.getUserDonations(req.user.id);
        return new HttpResponse("Donations fetched successfully", donations, HttpStatus.OK);
    }

    @ApiOperation({ summary: "Get all donations (Admin only)" })
    @ApiHttpErrorResponses()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get()
    async getAllDonations(): Promise<HttpResponse<any>> {
        const donations = await this.donationsService.getAllDonations();
        return new HttpResponse("All donations fetched successfully", donations, HttpStatus.OK);
    }
}
