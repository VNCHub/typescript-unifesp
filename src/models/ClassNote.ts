export interface IClassNote {
  id?: number;
  alunoMatriculaId: number;
  titulo: string;
  data?: Date;
  markdown: string;
}

export class ClassNote {
  public readonly id?: number;
  public alunoMatriculaId!: number;
  public titulo!: string;
  public readonly data?: Date;
  public markdown!: string;

  constructor(props: IClassNote) {
    if (!props.alunoMatriculaId)
      throw new Error("É necessário associar a nota a uma matrícula do aluno");
    
    if (!props.titulo || props.titulo.trim() === "")
      throw new Error("É necessário informar o título da nota de aula");
    
    if (!props.markdown || props.markdown.trim() === "")
      throw new Error("É necessário informar o conteúdo da nota de aula em markdown");

    Object.assign(this, props);

    if (!props.data) {
      this.data = new Date();
    }
  }
}