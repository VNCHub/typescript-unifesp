// src/controllers/EnrollmentController.ts
import { Request, Response } from 'express';
import { EnrollmentService } from '../services/EnrollmentService';

export class EnrollmentController {
  private service = new EnrollmentService();

  constructor() {
    this.getByUserId = this.getByUserId.bind(this)
    this.enroll = this.enroll.bind(this);
    this.unenroll = this.unenroll.bind(this);
  }

  async getByUserId(req: Request, res: Response) {
    try {
      const userId = Number(req.params.userId);
      const enrollments = await this.service.getByUserId(userId);
      return res.json(enrollments);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  async enroll(req: Request, res: Response) {
    try {
      const enrolled = await this.service.enroll(req.body);
      return res.status(201).json(enrolled);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  async unenroll(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await this.service.unenroll(id);
      return res.status(204).send();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export default new EnrollmentController();
