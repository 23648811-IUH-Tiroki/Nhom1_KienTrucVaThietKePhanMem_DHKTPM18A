import * as settingService from "../services/settingService.js";
import { sendControllerError } from "../utils/controllerError.js";

export const getSettings = async (req, res) => {
  try {
    const result = await settingService.getSettings();
    return res.status(200).json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const updateSettings = async (req, res) => {
  try {
    const result = await settingService.updateSettings(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};