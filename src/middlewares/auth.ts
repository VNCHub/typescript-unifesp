import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Tipagem do payload do token (você pode adicionar mais dados)
export interface JwtPayload {
  id: number;
  email: string;
  tipo: string;
}

// Tipar a request para incluir o user
declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET || "local_secret";

    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.user = decoded;
    return next();
    
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
};
