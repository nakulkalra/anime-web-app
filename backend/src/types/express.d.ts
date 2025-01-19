// src/types/express.d.ts

import { User } from '@prisma/client'

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
    interface User extends UserPayload {}

    interface Request {
      user?: User;
      admin?: AdminPayload;
    }
  }
}

// Augment passport-specific types
declare module "passport" {
  interface Authenticator {
    serializeUser<TUser = Express.User, TID = number>(
      fn: (user: TUser, done: (err: any, id?: TID) => void) => void
    ): void;
    
    deserializeUser<TID = number, TUser = Express.User | false>(
      fn: (id: TID, done: (err: any, user?: TUser | false) => void) => void
    ): void;
  }
}