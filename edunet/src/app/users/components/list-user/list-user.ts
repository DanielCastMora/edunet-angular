
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-user',
  imports: [FormsModule],
  templateUrl: './list-user.html',
  styleUrl: './list-user.css'
})
export class ListUser {
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  busqueda: string = '';
  usuarioSeleccionado: any = null;

  private router = inject(Router);

  constructor(private userService: UserService) {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.userService.getUsers().subscribe({
      next: (res) => {
        this.usuarios = res;
        this.filtrarUsuarios();
      },
      error: (err) => {
        this.usuarios = [];
        this.usuariosFiltrados = [];
      }
    });
  }

  filtrarUsuarios() {
    const filtro = this.busqueda.trim().toLowerCase();
    if (!filtro) {
      this.usuariosFiltrados = this.usuarios;
    } else {
      this.usuariosFiltrados = this.usuarios.filter(u =>
        (u.nombres + ' ' + u.apellidos).toLowerCase().includes(filtro) ||
        (u.correo || '').toLowerCase().includes(filtro)
      );
    }
  }

  buscarUsuario() {
    this.filtrarUsuarios();
    this.usuarioSeleccionado = null;
  }

  seleccionarUsuario(user: any) {
    this.usuarioSeleccionado = user;
  }

  crearUsuario() {
    // Aquí podrías navegar a la vista de crear usuario o abrir un modal
    this.router.navigate(['/create-user'])
    
  }

  modificarUsuario() {
    if (this.usuarioSeleccionado) {
      this.router.navigate(['/edit-user', this.usuarioSeleccionado.correo]);
    }
  }

  eliminarUsuario() {
    if (this.usuarioSeleccionado && confirm('¿Seguro que deseas eliminar este usuario?')) {
      this.userService.deleteUser(this.usuarioSeleccionado.correo).subscribe({
        next: () => {
          alert('Usuario eliminado');
          this.cargarUsuarios();
          this.usuarioSeleccionado = null;
        },
        error: () => {
          alert('Error al eliminar usuario');
        }
      });
    }
  }

  obtenerRol(rol: string | number): string {
    switch (rol) {
      case '1': case 1: return 'Estudiante';
      case '2': case 2: return 'Profesor';
      case '3': case 3: return 'Acudiente';
      case '4': case 4: return 'Administrador';
      default: return 'Desconocido';
    }
  }
}
