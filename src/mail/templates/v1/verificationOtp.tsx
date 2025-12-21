import * as React from "react";
import { BaseTemplate } from "./base";
import { Text } from "@react-email/components";
import { CONFIGS } from "configs";

export interface VerificationOtpProps {
    otp: string;
}

const APP_NAME = CONFIGS.APP_NAME || "APP_NAME";

export const VerificationOtp = ({ otp }: VerificationOtpProps) => (
    <BaseTemplate previewText={`Verify your email with ${APP_NAME}`}>
        <Text style={{ fontSize: "20px", fontWeight: "bold" }}>Verify Your Email</Text>
        <Text>Use the following code to verify your email on {APP_NAME}:</Text>
        <Text style={{ fontSize: "24px", fontWeight: "bold", letterSpacing: "2px" }}>{otp}</Text>
    </BaseTemplate>
);
