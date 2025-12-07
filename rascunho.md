# <font color="lightgreen">Proposta inicial </font>

Aluno: Vinicius Carrocine Leite - Data: 12/11/2025

## <font color="lightgreen">Objetivo </font>

**Projeto base de Agenda de Alunos. Uma agenda que permite centralizar funcionalidades do dia a dia do aluno, facilitando o gerenciamento de atividades.**

Nota: Para o contexto do projeto será feito apenas o gerenciamento das atividades escolares, associadas a matérias e professores, mas é uma ideia escalável para integrar com outros serviços que usuários da unifesp têm acesso.

## <font color="lightgreen">Tecnologias </font>

* Node + Express (API e rotas)
* TypeScript
* EJS (para renderizar views no servidor)
* Bootstrap (para o visual via CDN)
* Prisma
* esbuild (para compilar o código frontend TypeScript → JS no `public/`)
* Docker

## <font color="lightgreen">Proposta de Estrutura</font>

```bash
/agenda-alunos
├─ .env
├─ package.json
├─ prisma/
│  └─ schema.prisma
├─ public/                     # assets estáticos (css, js, imagens)
│  └─ assets/...
├─ src/
│  ├─ server.ts                # entra e inicia o app
│  ├─ app.ts                   # configura express, view engine, middlewares
│  ├─ db.ts                    # PrismaClient
│  ├─ routes.ts                # rotas (mapear url → controller)
|  ├─ models/ 
│  ├─ controllers/             # controllers (recebem req e chamam services/views)
│  │  ├─ auth.controller.ts
│  │  ├─ student.controller.ts
│  │  └─ admin.controller.ts
│  ├─ services/                # lógica de negócio e acesso ao db (usando Prisma)
│  │  ├─ user.service.ts
│  │  └─ subject.service.ts
│  ├─ views/                   # templates EJS (ou Pug/Handlebars)
│  │  ├─ partials/             # navbar, footer, head
│  │  ├─ alunos.ejs
│  │  ├─ admin.ejs
│  │  └─ login.ejs
│  └─ shared/
│     ├─ middlewares.ts
│     └─ utils.ts
```

## <font color="lightgreen">Banco de dados </font>

### <font color="lightgreen">**Usuário** </font>

| Campo             | Tipo         | Descrição                          |
| ----------------- | ------------ | ---------------------------------- |
| `id`              | inteiro (PK) | Identificador único                |
| `nome`            | texto        | Nome completo do aluno             |
| `email`           | texto        | E-mail para login e contato        |
| `senha`           | texto        | Senha (armazenada de forma segura) |
| `data_nascimento` | data         | Data de nascimento                 |
| `tipo`            | enum         | Tipo do usuário (`ALUNO`, `ADMIN`) |
| `data_cadastro`   | datetime     | Data de criação do cadastro        |

> Observação: professores **não** têm registro como `Usuario`. Eles são entidades separadas gerenciadas pelo admin.

### <font color="lightgreen">**Aluno**</font>

| Campo            | Tipo         | Descrição                     |
| ---------------- | ------------ | ----------------------------- |
| `id`             | inteiro (PK) | Identificador único           |
| `id_usuario`     | inteiro (FK) | Identificador do usuário (FK) |
| `data_matricula` | datetime     | Data da matrícula             |

---

### <font color="lightgreen"> **Professor** </font>

| Campo           | Tipo         | Descrição                               |
| --------------- | ------------ | --------------------------------------- |
| `id`            | inteiro (PK) | Identificador único do professor        |
| `nome`          | texto        | Nome completo do professor              |
| `telefone`      | texto        | Telefone (opcional)                     |
| `especialidade` | texto        | Área de ensino (ex: Matemática, Física) |

> Observação: professores são **entidades administrativas** (sem login). O admin pode criar/editar/excluir professores para associá-los às matérias.

---

### <font color="lightgreen"> **Matéria** </font>

| Campo          | Tipo         | Descrição                                |
| -------------- | ------------ | ---------------------------------------- |
| `id`           | inteiro (PK) | Identificador único                      |
| `nome`         | texto        | Nome da matéria (ex: "História")         |
| `descricao`    | texto        | Descrição breve (opcional)               |
| `professor_id` | inteiro (FK) | Chave estrangeira para `Professor`       |
| `horario`      | texto        | Horário fixo da aula (ex: "Segunda 10h") |
| `sala`         | texto        | Sala onde ocorre a aula                  |

---

### <font color="lightgreen"> **Aluno_Matéria** </font>

| Campo        | Tipo         | Descrição                         |
| ------------ | ------------ | --------------------------------- |
| `id`         | inteiro (PK) | Identificador único               |
| `aluno_id`   | inteiro (FK) | Referência ao aluno               |
| `materia_id` | inteiro (FK) | Referência à matéria              |
| `nota`       | decimal      | Nota final ou média (opcional)    |
| `frequencia` | decimal      | Percentual de presença (opcional) |

---

### <font color="lightgreen"> **Tarefa** </font>

| Campo          | Tipo         | Descrição                    |
| -------------- | ------------ | ---------------------------- |
| `id`           | inteiro (PK) | Identificador único          |
| `materia_id`   | inteiro (FK) | Referência à matéria         |
| `titulo`       | texto        | Nome da tarefa               |
| `descricao`    | texto        | Detalhes da atividade        |
| `data_entrega` | data         | Prazo para entrega           |
| `status`       | texto        | “Pendente”, “Concluída” etc. |

<br></br>

## <font color="lightgreen"> Resumo dos endpoints </font>

1. **Admin** cadastra professores e matérias.
2. **Alunos** se cadastram e fazem login.
3. **Alunos** se matriculam nas matérias.
4. **Admin** pode criar tarefas associadas às matérias.
5. **Alunos** consultam matérias e tarefas.

### <font color="lightgreen"> 👤 **Autenticação / Usuários** </font>

| Método   | Rota             | Motivo                                        |
| -------- | ---------------- | --------------------------------------------- |
| `POST`   | `/auth/register` | Cadastro de novos alunos.                     |
| `POST`   | `/auth/login`    | Login do aluno ou admin (retorna token JWT).  |
| `GET`    | `/users/:id`     | Consultar dados básicos do aluno autenticado. |
| `DELETE` | `/users/:id`     | Excluir conta do aluno (ou admin remover).    |

### <font color="lightgreen"> 🧑‍🏫 **Professores** </font>

> Gerenciados apenas pelo admin.

| Método   | Rota            | Motivo                                   |
| -------- | --------------- | ---------------------------------------- |
| `GET`    | `/teachers`     | Listar professores cadastrados.          |
| `POST`   | `/teachers`     | Criar novo professor (feito pelo admin). |
| `DELETE` | `/teachers/:id` | Excluir professor.                       |

### <font color="lightgreen"> 📚 **Matérias** </font>

| Método   | Rota            | Motivo                                                     |
| -------- | --------------- | ---------------------------------------------------------- |
| `GET`    | `/subjects`     | Listar todas as matérias disponíveis.                      |
| `POST`   | `/subjects`     | Criar nova matéria (admin define o professor responsável). |
| `DELETE` | `/subjects/:id` | Excluir matéria.                                           |

### <font color="lightgreen"> 📝 **Matrículas** </font>

| Método   | Rota                     | Motivo                                           |
| -------- | ------------------------ | ------------------------------------------------ |
| `POST`   | `/enrollments`           | Aluno se matricula em uma matéria.               |
| `GET`    | `/students/:id/subjects` | Listar matérias em que o aluno está matriculado. |
| `DELETE` | `/enrollments/:id`       | Cancelar matrícula.                              |

### <font color="lightgreen"> 📅 **Tarefas** </font>

| Método   | Rota         | Motivo                                            |
| -------- | ------------ | ------------------------------------------------- |
| `GET`    | `/tasks`     | Listar todas as tarefas (ou filtrar por matéria). |
| `POST`   | `/tasks`     | Criar tarefa vinculada a uma matéria (admin).     |
| `DELETE` | `/tasks/:id` | Excluir tarefa.                                   |
