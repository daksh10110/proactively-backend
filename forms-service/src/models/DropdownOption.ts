import { Table, Column, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Element } from '../models/Element';
import { DataTypes } from 'sequelize';

@Table
export class DropdownOption extends Model {
  @Column({ type: DataTypes.STRING })
  label!: string;

  @ForeignKey(() => Element)
  @Column({ type: DataTypes.UUID })
  elementId!: string;

  @BelongsTo(() => Element)
  element!: Element;
}