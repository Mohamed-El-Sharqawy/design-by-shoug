import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";

export abstract class AddressService {
  static async getAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  static async createAddress(
    userId: string,
    data: {
      label?: string;
      fullName: string;
      phone: string;
      country: string;
      city: string;
      district?: string;
      street: string;
      building?: string;
      apartment?: string;
      postalCode?: string;
      isDefault?: boolean;
    }
  ) {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.address.create({
      data: { ...data, userId },
    });
  }

  static async updateAddress(
    id: string,
    userId: string,
    data: {
      label?: string;
      fullName?: string;
      phone?: string;
      country?: string;
      city?: string;
      district?: string;
      street?: string;
      building?: string;
      apartment?: string;
      postalCode?: string;
      isDefault?: boolean;
    }
  ) {
    const address = await prisma.address.findFirst({ where: { id, userId } });
    if (!address) throw new NotFoundError("Address");

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id },
      data,
    });
  }

  static async deleteAddress(id: string, userId: string) {
    const address = await prisma.address.findFirst({ where: { id, userId } });
    if (!address) throw new NotFoundError("Address");

    await prisma.address.delete({ where: { id } });
  }
}
