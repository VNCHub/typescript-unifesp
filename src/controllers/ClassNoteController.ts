// src/controllers/ClassNoteController.ts
import { Request, Response } from 'express';
import { ClassNoteService } from '../services/ClassNoteService';

export class ClassNoteController {
  private service = new ClassNoteService();

  constructor() {
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async getAll(_req: Request, res: Response) {
    try {
      const notes = await this.service.getAll();
      return res.json(notes);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const note = await this.service.getById(id);
      return res.json(note);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const created = await this.service.create(req.body);
      return res.status(201).json(created);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const updated = await this.service.update(id, req.body);
      return res.json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await this.service.delete(id);
      return res.status(204).send();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export default new ClassNoteController();