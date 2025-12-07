export interface IEnrollment {
  id?: number;
  aluno_id: number;
  materia_id: number;
  nota?: number;
  frequencia?: number;
}

export class Enrollment {
  public readonly id?: number;
  public aluno_id!: number;
  public materia_id!: number;
  public nota?: number;
  public frequencia?: number;

  constructor(props: IEnrollment) {
    if (!props.aluno_id)
      throw new Error("Aluno deve ser informado para matrícula");
    if (!props.materia_id)
      throw new Error("Matéria deve ser informada para matrícula");

    Object.assign(this, props);
  }
}
