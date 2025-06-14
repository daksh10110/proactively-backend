import { Table, Column, Model, HasMany, DataType, PrimaryKey, Default } from 'sequelize-typescript';
import { Element } from './Element';

@Table
export class Form extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;  @Column({ type: DataType.STRING })
    label!: string;

  @Column({ type: DataType.STRING })
  title!: string;

  @HasMany(() => Element)
  elements!: Element[];
}
