// src/repositories/SubjectRepository.ts
import { prisma } from '../db';
import { Subject } from '../models/Subject';

export class SubjectRepository {
  async findAll() {
    return prisma.materia.findMany({
      include: { professor: true },
      orderBy: { nome: 'asc' },
    });
  }

  async findById(id: number) {
    return prisma.materia.findUnique({
      where: { id },
      include: { professor: true },
    });
  }

  async create(subject: Subject) {
    return prisma.materia.create({
      data: {
        nome: subject.nome,
        descricao: subject.descricao,
        professorId: subject.professorId,
        horario: subject.horario,
        sala: subject.sala,
      },
      include: { professor: true },
    });
  }

  async update(id: number, subject: Partial<Subject>) {
    return prisma.materia.update({
      where: { id },
      data: subject,
      include: { professor: true },
    });
  }

  async delete(id: number) {
    return prisma.materia.delete({ where: { id } });
  }
}
