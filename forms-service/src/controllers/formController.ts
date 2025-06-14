import { Request, Response } from 'express';
import { Form } from '../models/Form';
import { Element } from '../models/Element';
import { DropdownOption } from '../models/DropdownOption';

export const createForm = async (req: Request, res: Response) => {
  try {
    const { title, elements } = req.body;
    const form = await Form.create({ title });

    for (const el of elements) {
      const element = await Element.create({
        label: el.label,
        formId: form.id,
        type: el.type,
      });

      if (el.type.startsWith('dropdown') && el.options) {
        for (const opt of el.options) {
          await DropdownOption.create({
            label: opt,
            elementId: element.id,
          });
        }
      }
    }

    res.status(201).json({ formId: form.id });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

export const getForm = async (req: Request, res: Response) => {
    try {
        const formId = req.params.id;
        const form = await Form.findByPk(formId, {
            include: [{
                model: Element,
                as: 'elements',
                include: [{
                    model: DropdownOption,
                    as: 'dropdownOptions'
                }],
            }, ],
            order: [
                [ { model: Element, as: 'elements' }, 'id', 'ASC' ],
                [ { model: Element, as: 'elements' }, { model: DropdownOption, as: 'dropdownOptions' }, 'id', 'ASC' ]
            ]
        });

        if (!form) {
            res.status(404).json({ error: 'Form not found' });
            return;
        }
        res.status(200).json(form);
        return;
    } catch (err) {
        console.error(`Error fetching form ${req.params.id}:`, err);
        res.status(500).json({ error: 'Failed to fetch form' });
        return;
    }
};

export const getForms = async (req: Request, res: Response) => {
  try {
    const forms = await Form.findAll({
      include: [{
        model: Element,
        as: 'elements',
        include: [{
          model: DropdownOption,
          as: 'dropdownOptions'
        }],
      }],
      order: [
        [ { model: Element, as: 'elements' }, 'id', 'ASC' ],
        [ { model: Element, as: 'elements' }, { model: DropdownOption, as: 'dropdownOptions' }, 'id', 'ASC' ]
      ]
    });

    res.status(200).json(forms);
    return;
  } catch (err) {
    console.error('Error fetching forms:', err);
    res.status(500).json({ error: 'Failed to fetch forms' });
    return;
  }
};

export const deleteForm = async (req: Request, res: Response) => {
  try {
    const formId = req.params.id;
    const form = await Form.findByPk(formId);

    if (!form) {
      res.status(404).json({ error: 'Form not found' });
      return;
    }

    await form.destroy();
    res.status(204).send();
    return;
  } catch (err) {
    console.error(`Error deleting form ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to delete form' });
    return;
  }
}