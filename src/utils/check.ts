import { ResponseError } from "./responseError.js";

export const checkFileExist = (file:any) => {
    if(!file) {
        throw new ResponseError("File does not exist", 409, "file_not_found");
    }
   
}
export const checkFileMultiple = (files: any) => {
   
    if (!files || !Array.isArray(files) || files.length === 0) {
        throw new ResponseError("Files do not exist", 400, "files_not_found");
    }
    
    // အားလုံး အိုကေရင် ပုံနာမည်တွေကို Array အနေနဲ့ ပြန်ပေးမယ်
    return files.map((file: any) => file.filename);
};