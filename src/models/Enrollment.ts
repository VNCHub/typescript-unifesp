export interface IEnrollment {
  id?: number;
  alunoId: number;
  materiaId: number;
  nota?: number;
  frequencia?: number;
}

export class Enrollment {
  public readonly id?: number;
  public alunoId!: number;
  public materiaId!: number;
  public nota?: number;
  public frequencia?: number;

  constructor(props: IEnrollment) {
    if (!props.alunoId)
      throw new Error("Aluno deve ser informado para matrícula");
    if (!props.materiaId)
      throw new Error("Matéria deve ser informada para matrícula");

    Object.assign(this, props);
  }
}
