// src/controllers/SubjectController.ts
import { Request, Response } from 'express';
import { SubjectService } from '../services/SubjectService';
export class SubjectController {
  private service = new SubjectService();

  constructor() {
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async getAll(_req: Request, res: Response) {
    return res.json(await this.service.getAll());
  }

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    return res.json(await this.service.getById(id));
  }

  async create(req: Request, res: Response) {
    try {
      const created = await this.service.create(req.body);
      return res.status(201).json(created);
    } catch (err: any) {
      if (err.code === "PROF_NOT_FOUND") {
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: "Erro ao criar matéria" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const updated = await this.service.update(id, req.body);
      return res.json(updated);
    } catch (err: any) {
      if (err.code === "PROF_NOT_FOUND") {
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: "Erro ao atualizar matéria" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await this.service.delete(id);
      return res.status(204).send();
    } catch (err: any) {
      return res.status(500).json({ error: "Erro ao deletar matéria" });
    }
  }
}

export default new SubjectController();
