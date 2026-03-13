import { ResponseError } from "./responseError.js";

export const checkFileExist = (file:any) => {
    if(!file) {
        throw new ResponseError("File does not exist", 409, "file_not_found");
    }
   
}