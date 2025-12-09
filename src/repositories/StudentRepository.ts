// src/repositories/StudentRepository.ts
import { prisma } from '../db';
import { Student } from '../models/Student';

export class StudentRepository {
  async findAll() {
    return prisma.aluno.findMany({
      include: { usuario: true },
      orderBy: { dataMatricula: 'desc' },
    });
  }

  async findById(id: number) {
    return prisma.aluno.findUnique({
      where: { id },
      include: { usuario: true },
    });
  }

  async findByUserId(userId: number) {
    return prisma.aluno.findFirst({
      where: { usuarioId: userId },
      include: { usuario: true },
    });
  }

  async create(student: Student) {
    return prisma.aluno.create({
      data: {
        usuarioId: student.id_usuario,
        dataMatricula: student.data_matricula,
      },
      include: { usuario: true },
    });
  }

  async update(id: number, student: Partial<Student>) {
    return prisma.aluno.update({
      where: { id },
      data: student,
      include: { usuario: true },
    });
  }

  async delete(id: number) {
    return prisma.aluno.delete({ where: { id } });
  }
}