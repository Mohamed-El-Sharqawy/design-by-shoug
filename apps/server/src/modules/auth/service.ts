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

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      emailVerified: user.emailVerified,
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

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry,
      },
    });

    await sendPasswordResetEmail(email, resetToken);
  }

  static async resetPassword(input: ResetPasswordInput) {
    const users = await prisma.user.findMany({
      where: {
        resetToken: { not: null },
        resetTokenExpiry: { gt: new Date() },
      },
      select: { id: true, resetToken: true },
    });

    let foundUser: { id: string } | null = null;

    for (const user of users) {
      const isValid = await verifyPassword(input.token, user.resetToken!);
      if (isValid) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      throw new ValidationError("Invalid or expired reset token");
    }

    const passwordHash = await hashPassword(input.password);

    await prisma.user.update({
      where: { id: foundUser.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
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
        emailVerified: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    return user;
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
        emailVerified: true,
      },
    });

    if (!user) return null;

    return user;
  }

  static async sendOtp(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true },
    });
    if (!user || user.emailVerified) return;

    const otp = generateOtp();
    const otpHash = await hashPassword(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otpHash,
        otpExpiry,
        otpPurpose: "VERIFY_EMAIL",
        otpAttempts: 0,
      },
    });

    await sendOtpEmail(email, otp, "VERIFY_EMAIL");
  }

  static async verifyEmail(input: VerifyEmailInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        emailVerified: true,
        otpCode: true,
        otpExpiry: true,
        otpAttempts: true,
      },
    });
    if (!user) {
      throw new ValidationError("Invalid or expired code");
    }

    if (user.emailVerified) {
      throw new ValidationError("Email is already verified");
    }

    if (!user.otpCode || !user.otpExpiry || user.otpExpiry < new Date()) {
      throw new ValidationError("Code has expired. Please request a new one.");
    }

    if (user.otpAttempts >= 5) {
      throw new ValidationError("Too many attempts. Please request a new code.");
    }

    const isValid = await verifyPassword(input.otp, user.otpCode);

    if (!isValid) {
      await prisma.user.update({
        where: { id: user.id },
        data: { otpAttempts: { increment: 1 } },
      });
      throw new ValidationError("Invalid code");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        otpCode: null,
        otpExpiry: null,
        otpPurpose: null,
        otpAttempts: 0,
      },
    });

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

    await prisma.user.update({
      where: { id: userId },
      data: {
        otpCode: otpHash,
        otpExpiry,
        otpPurpose: "CHANGE_EMAIL",
        pendingEmail: input.newEmail,
        otpAttempts: 0,
      },
    });

    await sendOtpEmail(user.email, otp, "CHANGE_EMAIL");
  }

  static async verifyEmailChange(userId: string, input: VerifyEmailChangeInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        otpCode: true,
        otpExpiry: true,
        otpAttempts: true,
        otpPurpose: true,
        pendingEmail: true,
      },
    });

    if (!user || user.otpPurpose !== "CHANGE_EMAIL") {
      throw new ValidationError("No pending email change request");
    }

    if (!user.otpCode || !user.otpExpiry || user.otpExpiry < new Date()) {
      throw new ValidationError("Code has expired. Please request a new one.");
    }

    if (user.otpAttempts >= 5) {
      throw new ValidationError("Too many attempts. Please request a new code.");
    }

    if (!user.pendingEmail) {
      throw new ValidationError("No pending email found");
    }

    const isValid = await verifyPassword(input.otp, user.otpCode);
    if (!isValid) {
      await prisma.user.update({
        where: { id: userId },
        data: { otpAttempts: { increment: 1 } },
      });
      throw new ValidationError("Invalid code");
    }

    const newEmail = user.pendingEmail;

    await prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail,
        emailVerified: true,
        otpCode: null,
        otpExpiry: null,
        otpPurpose: null,
        pendingEmail: null,
        otpAttempts: 0,
      },
    });

    return { email: newEmail };
  }}
