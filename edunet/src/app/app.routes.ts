import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'gestion-usuarios',
        loadComponent: () => import('./users/components/list-user/list-user').then(m => m.ListUser)
    },
    {
        path: 'create-user',
        loadComponent: () => import('./users/components/create-edit-user/create-edit-user').then(m => m.CreateEditUser)
    },
    {
        path: 'edit-user/:correo',
        loadComponent: () => import('./users/components/create-edit-user/create-edit-user').then(m => m.CreateEditUser)
    }
];
