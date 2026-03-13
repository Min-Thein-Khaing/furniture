import { ResponseError } from "./responseError.js";

export const checkUserExist = (user: any) => {
  if (user) {
    const error: any = new Error("phone already exist");
    error.status = 400;
    error.code = "error not found";
    throw error;
  }
};
export const checkUserNotExist = (user: any) => {
  if (!user) {
    throw new ResponseError("User does not exist", 400, "user_not_found");
  }
};

export const checkOtpRow = (otpRow: any) => {
  if (!otpRow) {
    const error: any = new Error("phone not found");
    error.status = 400;
    error.code = "error not found";
    throw error;
  }
};
export const checkErrorIfSameDate = (isSameDate: boolean, error: number) => {
  if (isSameDate && error === 5) {
    const error: any = new Error("Error limit.Try again Tomorrow");
    error.status = 405;
    error.code = "error not found";
    throw error;
  }
};

export const checkUserErrorIfSameDate = (
  isSameDate: boolean,
  error: number,
) => {
  if (isSameDate && error === 3) {
    const error: any = new Error(
      "Your account is Temporarily Freeze.Please Contact us.",
    );
    error.status = 405;
    error.code = "error not found";
    throw error;
  }
};
