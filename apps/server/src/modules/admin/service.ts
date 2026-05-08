import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { ConflictError, UnauthorizedError } from "@/lib/errors";
import type { AdminLoginInput, CreateAdminInput } from "./model";

export abstract class AdminService {
  static async getStats() {
    const [
      totalOrders,
      paidRevenue,
      pendingRevenue,
      totalProducts,
      totalCustomers,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PENDING" } }),
      prisma.product.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          items: { take: 1 },
          address: { select: { fullName: true } },
        },
      }),
    ]);

    return {
      totalOrders,
      totalRevenue: Number(paidRevenue._sum.total || 0),
      pendingRevenue: Number(pendingRevenue._sum.total || 0),
      totalProducts,
      totalCustomers,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.address?.fullName || "Guest",
        total: Number(o.total),
        status: o.status,
        createdAt: o.createdAt,
      })),
    };
  }
  static async login(input: AdminLoginInput) {
    const admin = await prisma.user.findFirst({
      where: {
        email: input.email,
        role: "ADMIN",
      },
    });

    if (!admin) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (!admin.isActive) {
      throw new UnauthorizedError("Account is deactivated");
    }

    const isValidPassword = await verifyPassword(input.password, admin.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid credentials");
    }

    await prisma.user.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
    };
  }

  static async createAdmin(input: CreateAdminInput) {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingAdmin) {
      throw new ConflictError("Email already registered");
    }

    const passwordHash = await hashPassword(input.password);

    const admin = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: "ADMIN",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    return admin;
  }

  static async listAdmins() {
    return prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async toggleAdminStatus(adminId: string, isActive: boolean) {
    return prisma.user.update({
      where: { id: adminId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });
  }
}
