
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-create-edit-user',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './create-edit-user.html',
  styleUrl: './create-edit-user.css'
})
export class CreateEditUser {
  usuario: any = {
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    documento: '',
    direccion: '',
    contrasena: '',
    rol: '',
    grado: '',
    contacto_emergencia: '',
    telefono_contacto_emergencia: '',
    curso_asignado: '',
    estudiante_relacionado: '',
    parentesco: '',
    cargo: ''
  };
  editMode = false;

  constructor(private userService: UserService, private route: ActivatedRoute, private router: Router) {
    this.route.paramMap.subscribe(params => {
      const correo = params.get('correo');
      if (correo) {
        this.editMode = true;
        this.userService.getUserByCorreo(correo).subscribe({
          next: (user) => {
            this.usuario = { ...user, contrasena: '' };
          },
          error: () => {
            alert('No se pudo cargar el usuario');
            this.router.navigate(['/']);
          }
        });
      }
    });
  }

  onSubmit() {
    if (this.editMode) {
      // No enviar campo correo en el body, solo los editables
      const usuarioEdit = { ...this.usuario };
      delete usuarioEdit.correo;
      if (!usuarioEdit.contrasena) delete usuarioEdit.contrasena;
      this.userService.updateUser(this.usuario.correo, usuarioEdit).subscribe({
        next: () => {
          alert('Usuario actualizado correctamente');
          this.router.navigate(['/']);
        },
        error: (err) => {
          alert('Error al actualizar usuario: ' + (err.error?.error || 'Error desconocido'));
        }
      });
    } else {
      this.userService.createUser(this.usuario).subscribe({
        next: (res) => {
          alert('Usuario registrado correctamente');
          this.usuario = {
            nombres: '',
            apellidos: '',
            correo: '',
            telefono: '',
            documento: '',
            direccion: '',
            contrasena: '',
            rol: '',
            grado: '',
            contacto_emergencia: '',
            telefono_contacto_emergencia: '',
            curso_asignado: '',
            estudiante_relacionado: '',
            parentesco: '',
            cargo: ''
          };
        },
        error: (err) => {
          alert('Error al registrar usuario: ' + (err.error?.error || 'Error desconocido'));
        }
      });
    }
  }

  onRolChange() {
    // Limpiar campos específicos al cambiar de rol si es necesario
    if (this.usuario.rol !== '1') {
      this.usuario.grado = '';
      this.usuario.contacto_emergencia = '';
      this.usuario.telefono_contacto_emergencia = '';
    }
    if (this.usuario.rol !== '2') {
      this.usuario.curso_asignado = '';
    }
    if (this.usuario.rol !== '3') {
      this.usuario.estudiante_relacionado = '';
      this.usuario.parentesco = '';
    }
    if (this.usuario.rol !== '4') {
      this.usuario.cargo = '';
    }
  }
}
