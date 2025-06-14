import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  HasMany,
  DataType,
  PrimaryKey,
  Default,
} from 'sequelize-typescript';
import { Form } from './Form';
import { DropdownOption } from './DropdownOption';
import { ElementTypeName } from '../types/ElementEnum';

@Table
export class Element extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;  @Column({ type: DataType.STRING })
    label!: string;

  @ForeignKey(() => Form)
  @Column({ type: DataType.UUID })
  formId!: string;

  @Column({
    type: DataType.ENUM(...Object.values(ElementTypeName)),
    allowNull: false,
  })
  type!: ElementTypeName;

  @BelongsTo(() => Form)
  form!: Form;

  @HasMany(() => DropdownOption)
  dropdownOptions?: DropdownOption[];
}
