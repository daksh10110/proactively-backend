import { Request, Response as ExpressResponse } from 'express';
import { Response as ResponseModel } from '../models/Response';

export const postResponse = async (req: Request, res: ExpressResponse) => {
  try {
    const { formId, responseData, numberOfPeople } = req.body;

    if (!formId || !responseData) {
      res.status(400).json({ message: 'formId and responseData are required.' });
      return;
    }

    const response = await ResponseModel.create({
      formId,
      responseData,
      numberOfPeople: numberOfPeople || 1,
    });

    res.status(201).json(response);
    return;
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit response.', error });
    return;
  }
};

export const getResponses = async (req: Request, res: ExpressResponse) => {
  try {
    const { formId } = req.query;

    if (!formId) {
      res.status(400).json({ message: 'formId is required.' });
      return;
    }

    const responses = await ResponseModel.findAll({
      where: { formId },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json(responses);
    return;
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch responses.', error });
    return;
  }
};
