import { Request, Response } from 'express';
import { prisma } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class LoginController {
  async login(req: Request, res: Response) {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: 'email e senha são obrigatórios' });

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

    const ok = await bcrypt.compare(senha, usuario.senha);
    if (!ok) return res.status(400).json({ error: 'Senha incorreta' });

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo },
      process.env.JWT_SECRET || 'local_secret',
      { expiresIn: '1d' }
    );

    return res.json({ token , user: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo } });
  }

  async me(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: 'Não autenticado' });

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      include: { aluno: true },
    });

    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

    return res.json(usuario);
  }

async registrar(req: Request, res: Response) {
  const { nome, email, senha, data_nascimento } = req.body;
  if (!nome || !email || !senha || !data_nascimento)
    return res.status(400).json({ error: 'nome, email, senha e data_nascimento são obrigatórios' });

  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) return res.status(400).json({ error: 'E-mail já cadastrado' });

  const hash = await bcrypt.hash(senha, 10);

  const usuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      senha: hash,
      dataNascimento: new Date(data_nascimento),
      tipo: 'ALUNO'
    },
  });

  await prisma.aluno.create({
    data: {
      usuarioId: usuario.id
    }
  });

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
    process.env.JWT_SECRET || 'local_secret',
    { expiresIn: '1d' }
  );

  return res.json({ token });
}

}

export default new LoginController();
