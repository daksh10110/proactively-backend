import { Sequelize } from 'sequelize-typescript';
import { Form } from '../models/Form';
import { Element } from '../models/Element';
import { DropdownOption } from '../models/DropdownOption';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Response } from '../models/Response';

dotenv.config();

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  models: [Form, Element, DropdownOption, User, Response],
  logging: false,
});

export const initDB = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced');
  } catch (err) {
    console.error('DB Init failed', err);
  }
};
