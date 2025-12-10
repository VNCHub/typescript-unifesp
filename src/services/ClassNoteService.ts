// src/services/ClassNoteService.ts
import { ClassNote } from '../models/ClassNote';
import { ClassNoteRepository } from '../repositories/ClassNoteRepository';
import { EnrollmentRepository } from '../repositories/EnrollmentRepository';

export class ClassNoteService {
  private classNoteRepo: ClassNoteRepository;
  private enrollmentRepo: EnrollmentRepository;

  constructor() {
    this.classNoteRepo = new ClassNoteRepository();
    this.enrollmentRepo = new EnrollmentRepository();
  }

  async getAll() {
    return this.classNoteRepo.findAll();
  }

  async getAllByEnrollmentId(enrollmentId: number) {
    return this.classNoteRepo.findAllByEnrollmentId(enrollmentId);
  }

  async getById(id: number) {
    return this.classNoteRepo.findById(id);
  }

  async create(data: any) {
    const enrollment = await this.enrollmentRepo.findById(data.alunoMatriculaId);
    if (!enrollment) {
      const err: any = new Error("Matrícula não encontrada");
      err.code = "ENROLLMENT_NOT_FOUND";
      throw err;
    }

    const classNote = new ClassNote(data);
    return this.classNoteRepo.create(classNote);
  }

  async update(id: number, data: any) {
    if (data.alunoMatriculaId) {
      const enrollment = await this.enrollmentRepo.findById(data.alunoMatriculaId);
      if (!enrollment) {
        const err: any = new Error("Matrícula não encontrada");
        err.code = "ENROLLMENT_NOT_FOUND";
        throw err;
      }
    }

    return this.classNoteRepo.update(id, data);
  }

  async delete(id: number) {
    return this.classNoteRepo.delete(id);
  }
}
