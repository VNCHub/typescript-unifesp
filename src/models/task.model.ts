export type TaskStatus = "Pendente" | "Concluída" | "Atrasada";

export interface ITask {
  id?: number;
  materia_id: number;
  titulo: string;
  descricao: string;
  data_entrega: Date;
  status?: TaskStatus;
}

export class Task {
  public readonly id?: number;
  public materia_id!: number;
  public titulo!: string;
  public descricao!: string;
  public data_entrega!: Date;
  public status!: TaskStatus;

  constructor(props: ITask) {
    if (!props.titulo) throw new Error("Título da tarefa é obrigatório");
    if (!props.materia_id)
      throw new Error("A tarefa deve estar vinculada a uma matéria");
    if (!props.data_entrega)
      throw new Error("A tarefa deve ter data de entrega");

    Object.assign(this, props);

    if (!props.status) {
      this.status = "Pendente";
    }
  }
}
