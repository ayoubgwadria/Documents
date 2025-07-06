import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../core/environments';

export enum Role {
  PROFESSOR = 'PROFESSOR',
  STUDENT = 'STUDENT',
}

export interface CreateUserDTO {
  nom: string;
  email: string;
  motDePasse: string;
  role: Role;
}

export interface UserLoginDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
   id:number;
  token: string;
  email: string;
  role: Role;
 
}

export interface UserDTO {
  id: number;
  nom: string;
  email: string;
  role: Role;
}

@Injectable({
  providedIn: 'root',
})
export class UserServicesService {
  private apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  login(request: UserLoginDTO): Observable<LoginResponseDTO> {
    return this.http
      .post<LoginResponseDTO>(`${this.apiUrl}/login`, request)
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('email', response.email);
          localStorage.setItem('role', response.role);
          localStorage.setItem('id', response.id.toString());
        })
      );
  }
  createUser(request: CreateUserDTO): Observable<UserDTO> {
    return this.http.post<UserDTO>(this.apiUrl, request);
  }

  updateUser(id: number, request: CreateUserDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/${id}`, request);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getUserById(id: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/${id}`);
  }

  getAllUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(this.apiUrl);
  }
  getCurrentUserRole(): Role | null {
    const role = localStorage.getItem('role') as Role | null;
    return role;
  }
  getCurrentUserEmail(): String | null {
    const email = localStorage.getItem('email');
    return email;
  }
    getCurrentUserId(): String | null {
    const id = localStorage.getItem('id');
    return id;
  }
}
