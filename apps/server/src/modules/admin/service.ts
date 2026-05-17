import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { ConflictError, UnauthorizedError } from "@/lib/errors";
import type { AdminLoginInput, CreateAdminInput } from "./model";

export abstract class AdminService {
  static async getAnalytics(startDate: string | undefined, endDate: string | undefined) {
    const now = new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate
      ? new Date(endDate + "T23:59:59.999")
      : now;

    const daysDiff = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: {
        items: true,
        address: { select: { country: true, city: true } },
      },
    });

    const paidOrders = orders.filter((o) => o.paymentStatus === "PAID");
    const totalRevenue = paidOrders.reduce(
      (sum, o) => sum + Number(o.total),
      0
    );

    const revenueByDate = new Map<string, number>();
    paidOrders.forEach((o) => {
      const key = o.createdAt.toISOString().split("T")[0] ?? "";
      revenueByDate.set(key, (revenueByDate.get(key) || 0) + Number(o.total));
    });
    const revenueTrend = Array.from(revenueByDate.entries())
      .map(([date, revenue]) => ({
        date,
        revenue: Math.round(revenue * 100) / 100,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const ordersByDate = new Map<string, number>();
    orders.forEach((o) => {
      const key = o.createdAt.toISOString().split("T")[0] ?? "";
      ordersByDate.set(key, (ordersByDate.get(key) || 0) + 1);
    });
    const ordersOverTime = Array.from(ordersByDate.entries())
      .map(([date, orderCount]) => ({ date, orders: orderCount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const productMap = new Map<
      string,
      { name: string; sales: number; revenue: number }
    >();
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const existing = productMap.get(item.productNameEn) || {
          name: item.productNameEn,
          sales: 0,
          revenue: 0,
        };
        existing.sales += item.quantity;
        existing.revenue += Number(item.totalPrice);
        productMap.set(item.productNameEn, existing);
      });
    });
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10)
      .map((p) => ({ ...p, revenue: Math.round(p.revenue * 100) / 100 }));

    const topProduct =
      topProducts.length > 0
        ? { name: topProducts[0]!.name, sales: topProducts[0]!.sales }
        : null;

    const paymentMap = new Map<string, { count: number; revenue: number }>();
    orders.forEach((o) => {
      const method =
        o.paymentMethod === "CASH_ON_DELIVERY" ? "COD" : "ONLINE";
      const existing = paymentMap.get(method) || { count: 0, revenue: 0 };
      existing.count++;
      if (o.paymentStatus === "PAID") {
        existing.revenue += Number(o.total);
      }
      paymentMap.set(method, existing);
    });
    const totalRevenueAll = paidOrders.reduce(
      (sum, o) => sum + Number(o.total),
      0
    );
    const paymentMethods = Array.from(paymentMap.entries()).map(
      ([method, data]) => ({
        method,
        count: data.count,
        revenue: Math.round(data.revenue * 100) / 100,
        revenuePercentage:
          totalRevenueAll > 0
            ? Math.round((data.revenue / totalRevenueAll) * 1000) / 10
            : 0,
        countPercentage:
          orders.length > 0
            ? Math.round((data.count / orders.length) * 1000) / 10
            : 0,
      })
    );

    const internationalOrders = orders.filter((o) => {
      const c = o.address?.country?.toLowerCase() || "";
      return (
        c &&
        !c.includes("uae") &&
        !c.includes("emirates") &&
        !c.includes("united arab")
      );
    });
    const intCountryMap = new Map<string, number>();
    internationalOrders.forEach((o) => {
      const c = o.address?.country || "Unknown";
      intCountryMap.set(c, (intCountryMap.get(c) || 0) + 1);
    });
    const topIntCountry =
      Array.from(intCountryMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      null;

    const countryCityMap = new Map<string, Map<string, number>>();
    orders.forEach((o) => {
      const country = o.address?.country || "Unknown";
      const city = o.address?.city || "Unknown";
      if (!countryCityMap.has(country)) {
        countryCityMap.set(country, new Map());
      }
      const cities = countryCityMap.get(country)!;
      cities.set(city, (cities.get(city) || 0) + 1);
    });
    const topLocations = Array.from(countryCityMap.entries())
      .filter(([country]) => country !== "Unknown")
      .map(([country, cities]) => {
        const totalOrders = Array.from(cities.values()).reduce((s, c) => s + c, 0);
        const cityList = Array.from(cities.entries())
          .filter(([city]) => city !== "Unknown")
          .map(([city, orderCount]) => ({ city, orders: orderCount }))
          .sort((a, b) => b.orders - a.orders);
        return { country, orders: totalOrders, cities: cityList };
      })
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10);

    const pendingCODOrders = orders.filter(
      (o) =>
        o.paymentMethod === "CASH_ON_DELIVERY" &&
        o.paymentStatus === "PENDING"
    );
    const pendingCODRevenue = pendingCODOrders.reduce(
      (sum, o) => sum + Number(o.total),
      0
    );

    const userIds = [
      ...new Set(orders.map((o) => o.userId).filter(Boolean)),
    ] as string[];
    let returningCount = 0;
    if (userIds.length > 0) {
      const prevOrders = await prisma.order.findMany({
        where: {
          userId: { in: userIds },
          createdAt: { lt: start },
        },
        select: { userId: true },
        distinct: ["userId"],
      });
      returningCount = prevOrders.length;
    }
    const newCustomerCount = Math.max(0, userIds.length - returningCount);

    const newUsers = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        createdAt: { gte: start, lte: end },
      },
      select: { createdAt: true },
    });
    const customersByDate = new Map<string, number>();
    newUsers.forEach((u) => {
      const key = new Date(u.createdAt).toISOString().split("T")[0] ?? "";
      customersByDate.set(key, (customersByDate.get(key) || 0) + 1);
    });
    const newCustomersOverTime = Array.from(customersByDate.entries())
      .map(([date, customers]) => ({ date, customers }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const variantIds = new Set<string>();
    orders.forEach((o) =>
      o.items.forEach((item) => variantIds.add(item.variantId))
    );
    let productTypes: { type: string; sales: number }[] = [];
    if (variantIds.size > 0) {
      const variants = await prisma.productVariant.findMany({
        where: { id: { in: Array.from(variantIds) } },
        select: {
          id: true,
          product: { select: { productType: true } },
        },
      });
      const variantTypeMap = new Map(
        variants.map((v) => [v.id, v.product.productType])
      );
      const typeSales = new Map<string, number>();
      orders.forEach((o) => {
        o.items.forEach((item) => {
          const type = variantTypeMap.get(item.variantId) || "UNKNOWN";
          typeSales.set(type, (typeSales.get(type) || 0) + item.quantity);
        });
      });
      productTypes = Array.from(typeSales.entries()).map(([type, sales]) => ({
        type,
        sales,
      }));
    }

    const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");

    return {
      period: { start: start.toISOString(), end: end.toISOString() },
      orders: {
        total: orders.length,
        averagePerDay: Math.round((orders.length / daysDiff) * 100) / 100,
      },
      internationalOrders: {
        total: internationalOrders.length,
        topCountry: topIntCountry,
      },
      revenue: { total: Math.round(totalRevenue * 100) / 100 },
      pendingCOD: {
        orders: pendingCODOrders.length,
        revenue: Math.round(pendingCODRevenue * 100) / 100,
      },
      customers: { newCount: newCustomerCount, returningCount },
      topProduct,
      revenueTrend,
      ordersOverTime,
      topProducts,
      paymentMethods,
      newCustomersOverTime,
      topLocations,
      productTypes,
      delivery: {
        totalDelivered: deliveredOrders.length,
        totalOrders: orders.length,
      },
    };
  }

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
