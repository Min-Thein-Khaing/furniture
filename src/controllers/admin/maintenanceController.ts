import { NextFunction, Response , Request } from "express";
import { createOrUpdateSetting } from "../../services/setting.js";

interface CustomRequest extends Request {
    userId?: number;
    user?: any;
}
export const setMaintenance  = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
    const {mode}  = req.body;
    const value = mode ? "true" : "false";
    const message = mode ? "Maintenance Mode Activated" : "Maintenance Mode Deactivated";
    await createOrUpdateSetting("maintenance", value);
    
  res.status(200).json({ message: req.t(message) });
};

