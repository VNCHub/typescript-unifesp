// src/services/SubjectService.ts
import { Subject } from '../models/Subject';
import { SubjectRepository } from '../repositories/SubjectRepository';
import { ProfessorRepository } from '../repositories/ProfessorRepository';

export class SubjectService {
  private subjectRepo: SubjectRepository;
  private professorRepo: ProfessorRepository;

  constructor() {
    this.subjectRepo = new SubjectRepository();
    this.professorRepo = new ProfessorRepository();
  }

  async getAll() {
    return this.subjectRepo.findAll();
  }

  async getById(id: number) {
    return this.subjectRepo.findById(id);
  }

  async create(data: any) {
    const professor = await this.professorRepo.findById(data.professorId);
    if (!professor) {
      const err: any = new Error("Professor não encontrado");
      err.code = "PROF_NOT_FOUND";
      throw err;
    }

    const subject = new Subject(data);
    return this.subjectRepo.create(subject);
  }

  async update(id: number, data: any) {
    if (data.professorId) {
      const professor = await this.professorRepo.findById(data.professorId);
      if (!professor) {
        const err: any = new Error("Professor não encontrado");
        err.code = "PROF_NOT_FOUND";
        throw err;
      }
    }

    return this.subjectRepo.update(id, data);
  }

  async delete(id: number) {
    return this.subjectRepo.delete(id);
  }
}
