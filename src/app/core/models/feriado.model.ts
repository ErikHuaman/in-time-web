export interface Feriado {
  id?: string;
  title: string;
  start: Date;
  end?: Date;
  recurrente: boolean;
}
