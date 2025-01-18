// types/user.ts
export interface UserPayload {
  id: number;
  email: string;
}
export interface AdminPayload {
  id: number;
  email?: string;
}
declare global {
  namespace Express {
    // Extend the Request interface in the Express namespace
    export interface Request {
      user?: UserPayload;
      admin?: AdminPayload;

    }
  }
}
