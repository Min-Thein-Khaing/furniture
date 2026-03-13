// export class ResponseError extends Error {
//     public status: number;
//     public code : string;
//     constructor(message: string, status: number, code: string) {
//         super(message);
//         this.status = status;
//         this.code = code
//     }
// }


export class ResponseError extends Error {
  public status: number;
  public code: string;
  public messageKey: string;

  constructor(messageKey: string, status: number, code: string) {
    super(messageKey); // important for stack trace
    this.messageKey = messageKey;
    this.status = status;
    this.code = code;
  }
}