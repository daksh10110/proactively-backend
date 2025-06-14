import { Table, Column, Model } from 'sequelize-typescript';

export enum ElementTypeName {
  TEXTBOX_NUMERIC = 'textbox_numeric',
  TEXTBOX_ALPHANUMERIC = 'textbox_alphanumeric',
  DROPDOWN_SINGLE = 'dropdown_single',
  DROPDOWN_MULTI = 'dropdown_multi',
}