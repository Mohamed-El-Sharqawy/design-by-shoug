import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { sendPasswordResetEmail, sendOtpEmail } from "@/lib/mail";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import type {
  RegisterInput,
  LoginInput,
  ResetPasswordInput,
  ChangePasswordInput,
  UpdateProfileInput,
  VerifyEmailInput,
  RequestEmailChangeInput,
  VerifyEmailChangeInput,
} from "./model";
import { randomBytes, randomInt } from "crypto";

function generateOtp(): string {
  return String(randomInt(100000, 999999));
}

export abstract class AuthService {
  static async register(input: RegisterInput) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input.email },
          ...(input.phone ? [{ phone: input.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === input.email) {
        throw new ConflictError("Email already registered");
      }
      throw new ConflictError("Phone number already registered");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Account is deactivated");
    }

    const isValidPassword = await verifyPassword(input.password, user.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid email or password");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const emailVerified = await prisma.$queryRaw<Array<{ email_verified: boolean }>>`
      SELECT email_verified FROM users WHERE id = ${user.id}
    `;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      emailVerified: emailVerified[0]?.email_verified ?? false,
    };
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return;
    }

    const resetToken = randomBytes(32).toString("hex");
    const resetTokenHash = await hashPassword(resetToken);
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.$executeRaw`
      UPDATE users 
      SET reset_token = ${resetTokenHash}, reset_token_expiry = ${resetTokenExpiry}
      WHERE id = ${user.id}
    `;

    await sendPasswordResetEmail(email, resetToken);
  }

  static async resetPassword(input: ResetPasswordInput) {
    const users = await prisma.$queryRaw<Array<{ id: string; reset_token: string }>>`
      SELECT id, reset_token FROM users 
      WHERE reset_token IS NOT NULL 
      AND reset_token_expiry > NOW()
    `;

    let foundUser: { id: string } | null = null;

    for (const user of users) {
      const isValid = await verifyPassword(input.token, user.reset_token);
      if (isValid) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      throw new ValidationError("Invalid or expired reset token");
    }

    const passwordHash = await hashPassword(input.password);

    await prisma.$executeRaw`
      UPDATE users 
      SET password_hash = ${passwordHash}, reset_token = NULL, reset_token_expiry = NULL
      WHERE id = ${foundUser.id}
    `;
  }

  static async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    const isValidPassword = await verifyPassword(input.currentPassword, user.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    const passwordHash = await hashPassword(input.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    const otpRow = await prisma.$queryRaw<Array<{ email_verified: boolean }>>`
      SELECT email_verified FROM users WHERE id = ${userId}
    `;

    return { ...user, emailVerified: otpRow[0]?.email_verified ?? false };
  }

  static async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: input,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) return null;

    const otpRow = await prisma.$queryRaw<Array<{ email_verified: boolean }>>`
      SELECT email_verified FROM users WHERE id = ${userId}
    `;

    return { ...user, emailVerified: otpRow[0]?.email_verified ?? false };
  }

  static async sendOtp(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const otpRow = await prisma.$queryRaw<Array<{ email_verified: boolean }>>`
      SELECT email_verified FROM users WHERE id = ${user.id}
    `;
    if (otpRow[0]?.email_verified) return;

    const otp = generateOtp();
    const otpHash = await hashPassword(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.$executeRaw`
      UPDATE users 
      SET otp_code = ${otpHash}, otp_expiry = ${otpExpiry}, otp_purpose = 'VERIFY_EMAIL', otp_attempts = 0
      WHERE id = ${user.id}
    `;

    await sendOtpEmail(email, otp, "VERIFY_EMAIL");
  }

  static async verifyEmail(input: VerifyEmailInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new ValidationError("Invalid or expired code");
    }

    const row = await prisma.$queryRaw<
      Array<{ otp_code: string; otp_expiry: Date; otp_attempts: number; email_verified: boolean }>
    >`
      SELECT otp_code, otp_expiry, otp_attempts, email_verified FROM users WHERE id = ${user.id}
    `;

    const r = row[0];
    if (!r || r.email_verified) {
      throw new ValidationError("Email is already verified");
    }

    if (!r.otp_code || !r.otp_expiry || r.otp_expiry < new Date()) {
      throw new ValidationError("Code has expired. Please request a new one.");
    }

    if (r.otp_attempts >= 5) {
      throw new ValidationError("Too many attempts. Please request a new code.");
    }

    const isValid = await verifyPassword(input.otp, r.otp_code);

    if (!isValid) {
      await prisma.$executeRaw`
        UPDATE users SET otp_attempts = otp_attempts + 1 WHERE id = ${user.id}
      `;
      throw new ValidationError("Invalid code");
    }

    await prisma.$executeRaw`
      UPDATE users 
      SET email_verified = true, otp_code = NULL, otp_expiry = NULL, otp_purpose = NULL, otp_attempts = 0
      WHERE id = ${user.id}
    `;

    return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone, role: user.role, emailVerified: true };
  }

  static async requestEmailChange(userId: string, input: RequestEmailChangeInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User");

    if (user.email === input.newEmail) {
      throw new ValidationError("This is already your email address");
    }

    const existing = await prisma.user.findUnique({ where: { email: input.newEmail } });
    if (existing) {
      throw new ConflictError("This email is already registered");
    }

    const otp = generateOtp();
    const otpHash = await hashPassword(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.$executeRaw`
      UPDATE users 
      SET otp_code = ${otpHash}, otp_expiry = ${otpExpiry}, otp_purpose = 'CHANGE_EMAIL', 
          pending_email = ${input.newEmail}, otp_attempts = 0
      WHERE id = ${userId}
    `;

    await sendOtpEmail(user.email, otp, "CHANGE_EMAIL");
  }

  static async verifyEmailChange(userId: string, input: VerifyEmailChangeInput) {
    const row = await prisma.$queryRaw<
      Array<{ otp_code: string; otp_expiry: Date; otp_attempts: number; pending_email: string | null; otp_purpose: string | null }>
    >`
      SELECT otp_code, otp_expiry, otp_attempts, pending_email, otp_purpose FROM users WHERE id = ${userId}
    `;

    const r = row[0];
    if (!r || r.otp_purpose !== "CHANGE_EMAIL") {
      throw new ValidationError("No pending email change request");
    }

    if (!r.otp_code || !r.otp_expiry || r.otp_expiry < new Date()) {
      throw new ValidationError("Code has expired. Please request a new one.");
    }

    if (r.otp_attempts >= 5) {
      throw new ValidationError("Too many attempts. Please request a new code.");
    }

    if (!r.pending_email) {
      throw new ValidationError("No pending email found");
    }

    const isValid = await verifyPassword(input.otp, r.otp_code);
    if (!isValid) {
      await prisma.$executeRaw`
        UPDATE users SET otp_attempts = otp_attempts + 1 WHERE id = ${userId}
      `;
      throw new ValidationError("Invalid code");
    }

    const newEmail = r.pending_email;

    await prisma.$executeRaw`
      UPDATE users 
      SET email = ${newEmail}, email_verified = true, 
          otp_code = NULL, otp_expiry = NULL, otp_purpose = NULL, pending_email = NULL, otp_attempts = 0
      WHERE id = ${userId}
    `;

    return { email: newEmail };
  }
}
