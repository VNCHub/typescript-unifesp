// src/services/EnrollmentService.ts
import { Enrollment } from '../models/Enrollment';
import { EnrollmentRepository } from '../repositories/EnrollmentRepository';
import { StudentRepository } from '../repositories/StudentRepository';
import { SubjectRepository } from '../repositories/SubjectRepository';

export class EnrollmentService {
  private enrollmentRepo: EnrollmentRepository;
  private studentRepo: StudentRepository;
  private subjectRepo: SubjectRepository;

  constructor() {
    this.enrollmentRepo = new EnrollmentRepository();
    this.studentRepo = new StudentRepository();
    this.subjectRepo = new SubjectRepository();
  }

  async getByUserId(userId: number) {
    const student = await this.studentRepo.findByUserId(userId);
    if (!student) {
      const err: any = new Error("Aluno não encontrado para este usuário");
      err.code = "STUDENT_NOT_FOUND";
      throw err;
    }

    return this.enrollmentRepo.findByStudentId(student.id!);
  }
  
  async enroll(data: any) {
    const student = await this.studentRepo.findById(data.alunoId);
    if (!student) {
      const err: any = new Error("Aluno não encontrado");
      err.code = "STUDENT_NOT_FOUND";
      throw err;
    }

    const subject = await this.subjectRepo.findById(data.materiaId);
    if (!subject) {
      const err: any = new Error("Matéria não encontrada");
      err.code = "SUBJECT_NOT_FOUND";
      throw err;
    }

    const enrollment = new Enrollment(data);
    return this.enrollmentRepo.create(enrollment);
  }

  async unenroll(id: number) {
    const enrollment = await this.enrollmentRepo.findById(id);
    if (!enrollment) {
      const err: any = new Error("Matrícula não encontrada");
      err.code = "ENROLLMENT_NOT_FOUND";
      throw err;
    }

    return this.enrollmentRepo.delete(id);
  }
}
