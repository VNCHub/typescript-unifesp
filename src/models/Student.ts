export interface IStudent {
  id?: number;
  id_usuario: number;
  data_matricula?: Date;
}

export class Student {
  public readonly id?: number;
  public id_usuario!: number;
  public readonly data_matricula?: Date;

  constructor(props: IStudent) {
    if (!props.id_usuario)
      throw new Error("É necessário associar um usuário a um aluno");

    Object.assign(this, props);

    if (!props.data_matricula) {
      this.data_matricula = new Date();
    }
  }
}
