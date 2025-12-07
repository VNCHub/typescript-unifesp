import { prisma } from "../db";

export class ProfessorRepository {
  async findAll() {
    return prisma.professor.findMany({
      orderBy: { nome: "asc" }
    });
  }

  async findById(id: number) {
    return prisma.professor.findUnique({
      where: { id },
    });
  }
}
