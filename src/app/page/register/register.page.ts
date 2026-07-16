import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonAvatar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
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
  lockClosedOutline,
  logoGoogle,
  logoWindows,
  mailOutline,
  school,
  shieldCheckmarkOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonAvatar,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
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
export class RegisterPage  {

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);

  readonly error = signal<string | null>(null);

  readonly form = this.fb.group(
    {
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
      ],
      confirmarPassword: [
        '',
        [
          Validators.required
        ]
      ]
    },
    {
      validators: this.passwordsIguales
    }
  );

  constructor() {
    addIcons({
      arrowForwardOutline,
      lockClosedOutline,
      logoGoogle,
      logoWindows,
      mailOutline,
      school,
      shieldCheckmarkOutline
    });
  }
  

  private passwordsIguales(
    control: AbstractControl
  ): ValidationErrors | null {

    const password = control.get('password')?.value;
    const confirmarPassword =
      control.get('confirmarPassword')?.value;

    return password === confirmarPassword
      ? null
      : { passwordsDiferentes: true };
  }

  async registrar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);

    const {
      correo,
      password
    } = this.form.getRawValue();

    try {
      console.log('Registro simulado:', {
        correo,
        password
      });

      this.form.reset();

      await this.router.navigate(['/chats']);

    } catch (error: unknown) {
      const mensaje =
        error instanceof Error
          ? error.message
          : 'Error de conexión con el servidor';

      this.error.set(mensaje);
    }
  }

  async registrarGoogle(): Promise<void> {
    console.log('Registro con Google');
  }

  async registrarMicrosoft(): Promise<void> {
    console.log('Registro con Microsoft');
  }

  async irInicioSesion(): Promise<void> {
    await this.router.navigate(['/login']);
  }
  
}