import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import {
  IonAvatar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonNote,
  IonRow,
  IonText
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  arrowForwardOutline,
  chatboxEllipsesOutline,
  eyeOffOutline,
  eyeOutline,
  lockClosedOutline,
  mailOutline,
  personAddOutline,
  schoolOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';

import {
  AuthService
} from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonAvatar,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCol,
    IonContent,
    IonGrid,
    IonIcon,
    IonInput,
    IonItem,
    IonItemDivider,
    IonLabel,
    IonNote,
    IonRow,
    IonText
  ]
})
export class LoginPage {

  private readonly fb =
    inject(NonNullableFormBuilder);

  private readonly router =
    inject(Router);

  private readonly authService =
    inject(AuthService);

  readonly error =
    signal<string | null>(null);

  readonly mostrarPassword =
    signal(false);

  readonly cargando =
    signal(false);

  readonly form = this.fb.group({
    correo: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8)
      ]
    ]
  });

  constructor() {
    addIcons({
      arrowForwardOutline,
      chatboxEllipsesOutline,
      eyeOffOutline,
      eyeOutline,
      lockClosedOutline,
      mailOutline,
      personAddOutline,
      schoolOutline,
      shieldCheckmarkOutline
    });
  }

  alternarPassword(): void {
    this.mostrarPassword.update(
      valor => !valor
    );
  }

  async iniciarS(): Promise<void> {

    this.error.set(null);
    this.form.markAllAsTouched();

    if (
      this.form.invalid ||
      this.cargando()
    ) {
      return;
    }

    this.cargando.set(true);

    const {
      correo,
      password
    } = this.form.getRawValue();

    try {

      await this.authService.iniciarSesion(
        correo,
        password
      );

      this.form.reset();

      await this.router.navigateByUrl(
        '/chats',
        {
          replaceUrl: true
        }
      );

    } catch (error: unknown) {

      this.error.set(
        this.authService.obtenerMensajeError(error)
      );

    } finally {

      this.cargando.set(false);
    }
  }

  async irRegistro(): Promise<void> {
    await this.router.navigateByUrl('/register');
  }

  async irRecuperarPassword(): Promise<void> {
    await this.router.navigateByUrl(
      '/forgot-password'
    );
  }
}