export type UserType = "ALUNO" | "ADMIN";

export interface IUser {
  id?: number;
  nome: string;
  email: string;
  senha: string;
  data_nascimento: Date;
  tipo: UserType;
  data_cadastro?: Date;
}

export class User {
  public readonly id?: number;
  public readonly data_cadastro?: Date;
  public nome!: string;
  public email!: string;
  public senha!: string;
  public data_nascimento!: Date;
  public tipo!: UserType;

  constructor(props: IUser  ) {
    if (!props.nome) throw new Error("Nome é obrigatório");
    if (!props.email) throw new Error("Email é obrigatório");
    if (!props.senha) throw new Error("Senha é obrigatória");
    if (!props.tipo) throw new Error("Tipo de usuário é obrigatório");

    Object.assign(this, props);

    // Se estiver criando um novo usuário, define a data de cadastro:
    if (!props.data_cadastro) {
      this.data_cadastro = new Date();
    }
  }
}
