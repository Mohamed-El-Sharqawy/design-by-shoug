import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import type { CreateAbayaLengthInput, UpdateAbayaLengthInput } from "./model";

export abstract class AbayaLengthService {
  static async getAll(includeInactive = false) {
    return prisma.abayaLength.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  static async getById(id: string) {
    const length = await prisma.abayaLength.findUnique({ where: { id } });

    if (!length) {
      throw new NotFoundError("AbayaLength");
    }

    return length;
  }

  static async create(input: CreateAbayaLengthInput) {
    return prisma.abayaLength.create({ data: input });
  }

  static async update(id: string, input: UpdateAbayaLengthInput) {
    const existing = await prisma.abayaLength.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundError("AbayaLength");
    }

    return prisma.abayaLength.update({
      where: { id },
      data: input,
    });
  }

  static async delete(id: string) {
    const existing = await prisma.abayaLength.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundError("AbayaLength");
    }

    await prisma.abayaLength.delete({ where: { id } });
  }
}
