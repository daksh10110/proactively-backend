import { Table, Column, Model, ForeignKey, DataType, PrimaryKey, Default, BelongsTo } from 'sequelize-typescript';
import { Form } from './Form';

@Table
export class Response extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Form)
  @Column(DataType.UUID)
  formId!: string;

  @BelongsTo(() => Form)
  form!: Form;

  @Column({ type: DataType.JSONB })
  responseData!: object;

  @Column({ type: DataType.INTEGER, defaultValue: 1 })
  numberOfPeople!: number;
}