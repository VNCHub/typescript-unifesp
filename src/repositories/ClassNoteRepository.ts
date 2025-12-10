// src/repositories/ClassNoteRepository.ts
import { prisma } from '../db';
import { ClassNote } from '../models/ClassNote';

export class ClassNoteRepository {
  async findAll() {
    return prisma.notaDeAula.findMany({
      include: { 
        alunoMateria: {
          include: {
            aluno: { include: { usuario: true } },
            materia: { include: { professor: true } }
          }
        }
      },
      orderBy: { data: 'desc' },
    });
  }

  async findById(id: number) {
    return prisma.notaDeAula.findUnique({
      where: { id },
      include: { 
        alunoMateria: {
          include: {
            aluno: { include: { usuario: true } },
            materia: { include: { professor: true } }
          }
        }
      },
    });
  }

  async create(classNote: ClassNote) {
    return prisma.notaDeAula.create({
      data: {
        alunoMatriculaId: classNote.alunoMatriculaId,
        titulo: classNote.titulo,
        data: classNote.data,
        markdown: classNote.markdown,
      },
      include: { 
        alunoMateria: {
          include: {
            aluno: { include: { usuario: true } },
            materia: { include: { professor: true } }
          }
        }
      },
    });
  }

  async update(id: number, classNote: Partial<ClassNote>) {
    return prisma.notaDeAula.update({
      where: { id },
      data: classNote,
      include: { 
        alunoMateria: {
          include: {
            aluno: { include: { usuario: true } },
            materia: { include: { professor: true } }
          }
        }
      },
    });
  }

  async delete(id: number) {
    return prisma.notaDeAula.delete({ where: { id } });
  }

  async findAllByEnrollmentId(enrollmentId: number) {
    return prisma.notaDeAula.findMany({
      where: { alunoMatriculaId: enrollmentId },
      include: { 
        alunoMateria: {
          include: {
            aluno: { include: { usuario: true } },
            materia: { include: { professor: true } }
          }
        }
      },
      orderBy: { data: 'desc' },
    });
  }
}
