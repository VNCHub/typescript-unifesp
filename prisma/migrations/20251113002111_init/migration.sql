-- CreateTable
CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "data_nascimento" DATETIME,
    "tipo" TEXT NOT NULL DEFAULT 'ALUNO',
    "data_cadastro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "alunos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "data_matricula" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "alunos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "professores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "especialidade" TEXT
);

-- CreateTable
CREATE TABLE "materias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "professorId" INTEGER NOT NULL,
    "horario" TEXT,
    "sala" TEXT,
    CONSTRAINT "materias_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "professores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "alunos_materias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "alunoId" INTEGER NOT NULL,
    "materiaId" INTEGER NOT NULL,
    "nota" REAL,
    "frequencia" REAL,
    CONSTRAINT "alunos_materias_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "alunos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "alunos_materias_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "materias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tarefas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "materiaId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "data_entrega" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    CONSTRAINT "tarefas_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "materias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "alunos_usuarioId_key" ON "alunos"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "alunos_materias_alunoId_materiaId_key" ON "alunos_materias"("alunoId", "materiaId");
