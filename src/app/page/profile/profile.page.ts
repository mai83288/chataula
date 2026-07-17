import {
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  Auth
} from '@angular/fire/auth';


import {
  Firestore
} from '@angular/fire/firestore';

import {
  onAuthStateChanged
} from 'firebase/auth';

import {
  doc,
  onSnapshot
} from 'firebase/firestore';

import {
  AuthService
} from '../../core/services/auth.service';

import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonNote,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

import {
  addIcons
} from 'ionicons';

import {
  checkmarkCircle,
  logOutOutline,
  mail,
  personCircleOutline,
  powerOutline,
  schoolOutline,
  shieldCheckmark
} from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonAvatar,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonNote,
    IonRow,
    IonText,
    IonTitle,
    IonToolbar
  ]
})
export class ProfilePage
  implements OnInit, OnDestroy {

  private readonly router =
    inject(Router);

  private readonly auth =
    inject(Auth);

  private readonly firestore =
    inject(Firestore);

  private readonly zone =
    inject(NgZone);

  private readonly authService =
    inject(AuthService);

  private detenerAutenticacion:
    (() => void) | null = null;

  private detenerPerfil:
    (() => void) | null = null;

  readonly correo =
    signal('Cargando...');

  readonly seguridad = signal(
    'Sesión iniciada con Firebase Auth'
  );

  readonly version = signal(
    'Chat Aula v2.4.0 · Academic Ecosystem'
  );

  readonly cerrandoSesion =
  signal(false);

  constructor() {

    addIcons({
      checkmarkCircle,
      logOutOutline,
      mail,
      personCircleOutline,
      powerOutline,
      schoolOutline,
      shieldCheckmark
    });
  }

  ngOnInit(): void {

    this.detenerAutenticacion =
      onAuthStateChanged(
        this.auth,

        usuario => {

          this.detenerPerfil?.();
          this.detenerPerfil = null;

          if (!usuario) {

            this.zone.run(() => {

              this.correo.set(
                'Correo no disponible'
              );

              void this.router.navigateByUrl(
                '/login',
                {
                  replaceUrl: true
                }
              );
            });

            return;
          }

          const referenciaPerfil = doc(
            this.firestore,
            'usuarios',
            usuario.uid
          );

          this.detenerPerfil = onSnapshot(
            referenciaPerfil,

            documentoPerfil => {

              if (!documentoPerfil.exists()) {

                this.zone.run(() => {

                  this.correo.set(
                    usuario.email ||
                    'Correo no disponible'
                  );
                });

                return;
              }

              const perfil =
                documentoPerfil.data();

              const correoFirestore =
                perfil['correo'];

              const correo =
                typeof correoFirestore === 'string' &&
                correoFirestore.trim().length > 0
                  ? correoFirestore.trim()
                  : usuario.email ||
                    'Correo no disponible';

              this.zone.run(() => {

                this.correo.set(
                  correo
                );
              });
            },

            error => {

              console.error(
                'Error al cargar el perfil:',
                error
              );

              this.zone.run(() => {

                this.correo.set(
                  usuario.email ||
                  'Correo no disponible'
                );
              });
            }
          );
        },

        error => {

          console.error(
            'Error al comprobar la sesión:',
            error
          );

          this.zone.run(() => {

            this.correo.set(
              'Correo no disponible'
            );
          });
        }
      );
  }

  ngOnDestroy(): void {

    this.detenerPerfil?.();
    this.detenerPerfil = null;

    this.detenerAutenticacion?.();
    this.detenerAutenticacion = null;
  }

  async cerrarSesion(): Promise<void> {

    if (this.cerrandoSesion()) {
      return;
    }

    this.cerrandoSesion.set(true);

    try {

      await this.authService.cerrarSesion();

      await this.router.navigateByUrl(
        '/login',
        {
          replaceUrl: true
        }
      );

    } catch (error: unknown) {

      console.error(
        'No fue posible cerrar la sesión:',
        error
      );

    } finally {

      this.cerrandoSesion.set(false);
    }
  }
}