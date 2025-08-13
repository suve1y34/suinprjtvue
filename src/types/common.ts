export class ApiResponse<T> {
  code?: number;
  message?: string;
  data!: T;

  constructor(data: T, opts?: { code?: number; message?: string }) {
    this.data = data;
    if (opts?.code !== undefined) this.code = opts.code;
    if (opts?.message !== undefined) this.message = opts.message;
  }
}

export class ApiError extends Error {
  status?: number;
  code?: number;
  payload?: unknown;

  constructor(message: string, opts?: { status?: number; code?: number; payload?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = opts?.status;
    this.code = opts?.code;
    this.payload = opts?.payload;
  }
}
