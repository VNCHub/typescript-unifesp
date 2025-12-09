// src/routes.ts
import { Router } from 'express';
import SubjectController from './controllers/SubjectController';
import LoginController from "./controllers/LoginController";

import { authMiddleware } from './middlewares/auth';
import { prisma } from './db';
import ProfessorController from './controllers/ProfessorController';
import EnrollmentController from './controllers/EnrollmentController';
import ClassNoteController from './controllers/ClassNoteController';

const router = Router();

/* Página Home (somente exibição em cards) */
router.get('/', async (_req, res) => {
  const subjects = await prisma.materia.findMany({ include: { professor: true } });
  res.render('layout', {title: 'Home', view: 'home', subjects, script: 'home.js'});
});

/* Rota admin para gerenciamento da matéria */
router.get('/subjects/admin', async (_req, res) => {
  const subjects = await prisma.materia.findMany({ include: { professor: true } });
  res.render('layout', { title: 'Gerenciar Matérias', view: 'subjects', subjects, script: 'subjects.js'});
});

/* Auth */
router.post('/api/login', LoginController.login);
router.post('/api/register', LoginController.registrar);
router.get('/api/me', authMiddleware, LoginController.me);

/* API REST de Subjects (Matérias) */
router.get('/api/subjects', SubjectController.getAll);
router.post('/api/subjects', SubjectController.create);
router.get('/api/subjects/:id', SubjectController.getById);
router.put('/api/subjects/:id', SubjectController.update);
router.delete('/api/subjects/:id', SubjectController.delete);

/* API REST de Enrollment (Matricula) */
router.get('/api/enrollment/user/:userId', EnrollmentController.getByUserId);
router.post('/api/enrollment', EnrollmentController.enroll);
router.delete('/api/enrollment/:id', EnrollmentController.unenroll);

/* API REST de ClassNotes (Notas de Aula) */
router.get('/api/classnotes', ClassNoteController.getAll);
router.get('/api/classnotes/:id', ClassNoteController.getById);
router.post('/api/classnotes', ClassNoteController.create);
router.put('/api/classnotes/:id', ClassNoteController.update);
router.delete('/api/classnotes/:id', ClassNoteController.delete);

/* API REST de Professors (Professores) */
router.get('/api/professors', ProfessorController.getAll);
router.get('/api/professors/:id', ProfessorController.getById);

/* Health check */
router.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

export default router;
