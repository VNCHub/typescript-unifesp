import { ProfessorRepository } from "../repositories/ProfessorRepository";

export class ProfessorService {
  private repository: ProfessorRepository;

  constructor() {
    this.repository = new ProfessorRepository();
  }

  async getAll() {
    return this.repository.findAll();
  }

  async getById(id: number) {
    return this.repository.findById(id);
  }
}
