export interface ITeacher {
  id?: number;
  nome: string;
  telefone?: string;
  especialidade: string;
}

export class Teacher {
  public readonly id?: number;
  public nome!: string;
  public telefone?: string;
  public especialidade!: string;

  constructor(props: ITeacher) {
    if (!props.nome) throw new Error("Nome do professor é obrigatório");
    if (!props.especialidade)
      throw new Error("Especialidade do professor é obrigatória");

    Object.assign(this, props);
  }
}
