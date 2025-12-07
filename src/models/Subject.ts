// src/models/Subject.ts
export interface ISubject {
  id?: number;
  nome: string;
  descricao?: string | null;
  professorId: number;
  horario?: string | null;
  sala?: string | null;
}

export class Subject {
  public readonly id?: number;
  public nome!: string;
  public descricao?: string | null;
  public professorId!: number;
  public horario?: string | null;
  public sala?: string | null;

  constructor(props: ISubject) {
    if (!props.nome) throw new Error("Nome da matéria é obrigatório");
    if (!props.professorId) throw new Error("Professor é obrigatório");

    Object.assign(this, props);
  }
}

