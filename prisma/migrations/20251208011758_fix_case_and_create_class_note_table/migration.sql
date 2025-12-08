/*
  Warnings:

  - You are about to drop the `tarefas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `data_matricula` on the `alunos` table. All the data in the column will be lost.
  - You are about to drop the column `data_cadastro` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `data_nascimento` on the `usuarios` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "tarefas";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "notas_aula" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "alunoMatriculaId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "markdown" TEXT NOT NULL,
    CONSTRAINT "notas_aula_alunoMatriculaId_fkey" FOREIGN KEY ("alunoMatriculaId") REFERENCES "alunos_materias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_alunos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "dataMatricula" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "alunos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_alunos" ("id", "usuarioId") SELECT "id", "usuarioId" FROM "alunos";
DROP TABLE "alunos";
ALTER TABLE "new_alunos" RENAME TO "alunos";
CREATE UNIQUE INDEX "alunos_usuarioId_key" ON "alunos"("usuarioId");
CREATE TABLE "new_usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "dataNascimento" DATETIME,
    "tipo" TEXT NOT NULL DEFAULT 'ALUNO',
    "dataCadastro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_usuarios" ("email", "id", "nome", "senha", "tipo") SELECT "email", "id", "nome", "senha", "tipo" FROM "usuarios";
DROP TABLE "usuarios";
ALTER TABLE "new_usuarios" RENAME TO "usuarios";
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
