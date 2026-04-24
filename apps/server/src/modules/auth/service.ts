import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { sendPasswordResetEmail } from "@/lib/mail";
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
} from "./model";
import { randomBytes } from "crypto";

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
    return prisma.user.findUnique({
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
  }
}
