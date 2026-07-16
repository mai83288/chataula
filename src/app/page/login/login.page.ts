
import { Component, inject, signal } from '@angular/core';
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
  IonItemDivider,
  IonLabel,
  IonNote,
  IonRow,
  IonText,
  IonItem
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
    IonItem,
    IonContent,
    IonGrid,
    IonIcon,
    IonInput,
    IonItemDivider,
    IonLabel,
    IonNote,
    IonRow,
    IonText
  ]})

export class LoginPage {

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);

  readonly error = signal<string | null>(null);
  readonly mostrarPassword = signal(false);

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
    this.mostrarPassword.update(valor => !valor);
  }

  async iniciarS(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);

    const { correo, password } = this.form.getRawValue();

    try {
      /*
       * Aquí se conectará posteriormente el servicio:
       *
       * const usuario = await this.authService.loginUsuario(
       *   correo,
       *   password
       * );
       */

      await this.router.navigate(['/chats']);

      this.form.reset();
    } catch (error: unknown) {
      const mensaje = error instanceof Error
        ? error.message
        : 'Error de conexión con el servidor';

      this.error.set(mensaje);
    }
  }

  async irRegistro(): Promise<void> {
    await this.router.navigate(['/register']);
  }

  async irRecuperarPassword(): Promise<void> {
    await this.router.navigate(['/forgot-password']);
  }
}
