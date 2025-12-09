// src/repositories/EnrollmentRepository.ts
import { prisma } from '../db';
import { Enrollment } from '../models/Enrollment';

export class EnrollmentRepository {
  async findAll() {
    return prisma.alunoMateria.findMany({
      include: { 
        aluno: true,
        materia: { include: { professor: true } }
      },
      orderBy: { id: 'desc' },
    });
  }

  async findById(id: number) {
    return prisma.alunoMateria.findUnique({
      where: { id },
      include: { 
        aluno: true,
        materia: { include: { professor: true } }
      },
    });
  }

  async findByStudentId(studentId: number) {
    return prisma.alunoMateria.findMany({
      where: { alunoId: studentId },
      include: { 
        aluno: true,
        materia: { include: { professor: true } }
      },
      orderBy: { id: 'desc' },
    });
  }

  async create(enrollment: Enrollment) {
    return prisma.alunoMateria.create({
      data: {
        alunoId: enrollment.alunoId,
        materiaId: enrollment.materiaId,
        nota: enrollment.nota,
        frequencia: enrollment.frequencia,
      },
      include: { 
        aluno: true,
        materia: { include: { professor: true } }
      },
    });
  }

  async update(id: number, enrollment: Partial<Enrollment>) {
    return prisma.alunoMateria.update({
      where: { id },
      data: enrollment,
      include: { 
        aluno: true,
        materia: { include: { professor: true } }
      },
    });
  }

  async delete(id: number) {
    return prisma.alunoMateria.delete({ where: { id } });
  }
}
