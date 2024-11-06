import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        title: 'List Google Drive Photos',
        loadComponent: () => import('./list-googledrive-photos/list-googledrive-photos.component'),
    },
    {
        //genereate a route for the ListGoogledrivePhotosComponent
        path: 'list-googledrive-photos',
        title: 'List Google Drive Photos',
        loadComponent: () => import('./list-googledrive-photos/list-googledrive-photos.component'),
    },
    {
        path: 'welcome/:myTokenParameter',
        title: 'Welcome',
        loadComponent: () => import('./welcome/welcome.component'),
    },
    {
        path: 'welcome',
        title: 'Welcome',
        loadComponent: () => import('./welcome/welcome.component'),
    },
    {
        path: 'app-not-found',
        loadComponent: () => import('./app-not-found/app-not-found.component'),
    },
    {
        path: '**', // Wildcard route for a 404 page
        redirectTo: 'app-not-found' 
    }
];
