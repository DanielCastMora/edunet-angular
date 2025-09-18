
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';
  private loginUrl = 'http://localhost:3000/api/login';
  private http = inject(HttpClient);

  getUsers(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getUserByCorreo(correo: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${correo}`);
  }

  createUser(usuario: any): Observable<any> {
    return this.http.post(this.apiUrl, usuario);
  }

  updateUser(correo: string, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${correo}`, usuario);
  }

  deleteUser(correo: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${correo}`);
  }

  login(usuario: string, password: string): Observable<any> {
    return this.http.post(this.loginUrl, { usuario, password });
  }
}
