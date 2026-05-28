import * as aiService from "../services/aiService.js";
import { sendControllerError } from "../utils/controllerError.js";

export const createChatAI = async (req, res) => {
  try {
    const result = await aiService.createChatAI(req.body.message);
    return res.json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};