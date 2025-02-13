export interface TServerResponse<T> {
    code: number;
    data?: T,
    message?: string;
    stackMessage?: string
}

export interface TServerCommonError {
    code: number;
    message: string;
    stackMessage?: string;
  }