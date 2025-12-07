import { Request, Response } from "express";
import { ProfessorService } from "../services/ProfessorService";

export class ProfessorController {
  private service: ProfessorService;

  constructor() {
    this.service = new ProfessorService();
  }

  getAll = async (_req: Request, res: Response) => {
    const profs = await this.service.getAll();
    return res.json(profs);
  };

  getById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const prof = await this.service.getById(id);

    if (!prof) return res.status(404).json({ error: "Professor não encontrado" });

    return res.json(prof);
  };
}

export default new ProfessorController();
