import {
  bootstrapApplication
} from '@angular/platform-browser';

import {
  PreloadAllModules,
  provideRouter,
  RouteReuseStrategy,
  withPreloading
} from '@angular/router';

import {
  IonicRouteStrategy,
  provideIonicAngular
} from '@ionic/angular/standalone';

import {
  initializeApp,
  provideFirebaseApp
} from '@angular/fire/app';

import {
  getAuth,
  provideAuth
} from '@angular/fire/auth';

import {
  getFirestore,
  provideFirestore
} from '@angular/fire/firestore';

import {
  Capacitor
} from '@capacitor/core';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';

const firebaseConfig = {
  projectId: 'upsin9-2-c2a6d',
  appId: '1:686080055801:web:3a3a842d2a65cb9be1c528',
  databaseURL:
    'https://upsin9-2-c2a6d-default-rtdb.firebaseio.com',
  storageBucket:
    'upsin9-2-c2a6d.firebasestorage.app',
  apiKey:
    'AIzaSyARmanV3lxtkgKl7YO7R6J5R5VvnsBbp-M',
  authDomain:
    'upsin9-2-c2a6d.firebaseapp.com',
  messagingSenderId:
    '686080055801',
  measurementId:
    'G-PQ0NMYJ0CC'
};

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },

    provideIonicAngular(),

    provideRouter(
      routes,
      withPreloading(PreloadAllModules)
    ),

    provideFirebaseApp(
      () => initializeApp(firebaseConfig)
    ),

    provideAuth(
      () => getAuth()
    ),

    provideFirestore(
      () => getFirestore()
    ), provideServiceWorker(
        'ngsw-worker.js',
        {
          enabled:
            !isDevMode() &&
            !Capacitor.isNativePlatform(),

          registrationStrategy:
            'registerWhenStable:30000'
        }
      )
  ]
}).catch((error: unknown) => {
  console.error(
    'Error al iniciar Chat Aula:',
    error
  );
});