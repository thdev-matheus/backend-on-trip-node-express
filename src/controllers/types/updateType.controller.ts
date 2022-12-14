import { Request, Response } from "express";
import { AppError } from "../../errors/AppError";
import updateTypeService from "../../services/types/updateType.service";

const updateTypeController = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const id = req.params.typeId;

    const updatedType = await updateTypeService({ name, id });

    return res
      .status(200)
      .send({ message: "Type updated with success", type: updatedType });
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.statusCode, error.message);
    }
  }
};

export default updateTypeController;
