import { ApiError, HttpStatusCode } from "@lodestar/api";

export class LodestarError extends Error {
    public code: HttpStatusCode
    public operationId: string | undefined
    public message: string

    constructor(error: ApiError ) {
        super("LodestarError")
        this.code = error.status
        this.message = error.message || "unknown error"
        this.operationId = error.operationId
     }
}
