// src/types/user.ts

export interface UserWithPassword {
    id: number;
    email: string;
    name: string | null;
    password: string;
  }
  
  export interface UserWithoutPassword {
    id: number;
    email: string;
    name: string | null;
  }