import { HttpStatusCode } from "@lodestar/api";

export class LodestarError extends Error {
    public code: HttpStatusCode
    public operationId: string | undefined
    public message: string

    constructor(error: { code: HttpStatusCode, message?: string, operationId?: string } ) {
        super("LodestarError")
        this.code = error.code
        this.message = error.message || "unknown error"
        this.operationId = error.operationId
     }
}
