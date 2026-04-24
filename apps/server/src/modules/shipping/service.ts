import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import type { CreateShippingZoneInput, UpdateShippingZoneInput } from "./model";

export abstract class ShippingService {
  static async getAll(includeInactive = false) {
    return prisma.shippingZone.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { nameEn: "asc" },
    });
  }

  static async getById(id: string) {
    const zone = await prisma.shippingZone.findUnique({ where: { id } });
    if (!zone) throw new NotFoundError("Shipping zone");
    return zone;
  }

  static async getByCity(city: string) {
    return prisma.shippingZone.findFirst({
      where: {
        isActive: true,
        cities: { has: city },
      },
    });
  }

  static async calculateShipping(city: string, orderAmount: number) {
    const zone = await this.getByCity(city);

    if (!zone) {
      return {
        available: false,
        message: "Shipping not available to this location",
      };
    }

    const isFreeShipping =
      zone.freeShippingMin && orderAmount >= Number(zone.freeShippingMin);

    return {
      available: true,
      zone: {
        id: zone.id,
        nameEn: zone.nameEn,
        nameAr: zone.nameAr,
      },
      cost: isFreeShipping ? 0 : Number(zone.baseCost),
      isFreeShipping,
      freeShippingMin: zone.freeShippingMin ? Number(zone.freeShippingMin) : null,
      estimatedDays: {
        min: zone.estimatedDaysMin,
        max: zone.estimatedDaysMax,
      },
    };
  }

  static async create(input: CreateShippingZoneInput) {
    return prisma.shippingZone.create({ data: input });
  }

  static async update(id: string, input: UpdateShippingZoneInput) {
    const existing = await prisma.shippingZone.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Shipping zone");

    return prisma.shippingZone.update({
      where: { id },
      data: input,
    });
  }

  static async delete(id: string) {
    const existing = await prisma.shippingZone.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Shipping zone");

    await prisma.shippingZone.delete({ where: { id } });
  }
}
