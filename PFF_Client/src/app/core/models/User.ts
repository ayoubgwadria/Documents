
export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string; 
  role: Role;
  profilePictureUrl?: string;
  lastLoginIp?: string;
  lastLoginTime?: string;  
  createdAt?: string;      
}

export enum Role {
  STUDENT = 'STUDENT',
  PROFESSOR = 'PROFESSOR',
  ADMIN = 'ADMIN',

}
