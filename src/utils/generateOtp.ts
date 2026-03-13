import crypto from "crypto";

export const generateOtp = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const generateToken = () =>{
    return crypto.randomBytes(16).toString('hex');
}