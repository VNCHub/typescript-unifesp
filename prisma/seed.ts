import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Professores de Harry Potter
  await prisma.professor.createMany({
    data: [
        { nome: "Minerva McGonagall", especialidade: "Transfiguração", telefone: "1111-1111" },
        { nome: "Severus Snape", especialidade: "Poções", telefone: "2222-2222" },
        { nome: "Remus Lupin", especialidade: "Defesa Contra as Artes das Trevas", telefone: "3333-3333" },
        { nome: "Filius Flitwick", especialidade: "Feitiços", telefone: "4444-4444" },
        { nome: "Sybill Trelawney", especialidade: "Adivinhação", telefone: "5555-5555" },
        { nome: "Rubeus Hagrid", especialidade: "Trato das Criaturas Mágicas", telefone: "6666-6666" },
        { nome: "Alastor Moody", especialidade: "Defesa Contra as Artes das Trevas", telefone: "7777-7777" },
        { nome: "Gilderoy Lockhart", especialidade: "Defesa Contra as Artes das Trevas", telefone: "8888-8888" },
        { nome: "Dolores Umbridge", especialidade: "Defesa Contra as Artes das Trevas", telefone: "9999-9999" },
        { nome: "Horace Slughorn", especialidade: "Poções", telefone: "0000-0000" }
    ]
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
