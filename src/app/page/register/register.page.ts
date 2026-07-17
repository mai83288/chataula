import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
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
  personOutline,
  school,
  shieldCheckmarkOutline
} from 'ionicons/icons';

import {
  AuthService
} from '../../core/services/auth.service';

const passwordsIgualesValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const password =
    control.get('password')?.value;

  const confirmarPassword =
    control.get('confirmarPassword')?.value;

  if (!password || !confirmarPassword) {
    return null;
  }

  return password === confirmarPassword
    ? null
    : {
        passwordsDiferentes: true
      };
};

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
export class RegisterPage {

  private readonly fb =
    inject(NonNullableFormBuilder);

  private readonly router =
    inject(Router);

  private readonly authService =
    inject(AuthService);

  readonly error =
    signal<string | null>(null);

  readonly cargando =
    signal(false);

  readonly form = this.fb.group(
    {
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50)
        ]
      ],

      apellidos: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(80)
        ]
      ],

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
      validators: passwordsIgualesValidator
    }
  );

  constructor() {
    addIcons({
      arrowForwardOutline,
      lockClosedOutline,
      logoGoogle,
      logoWindows,
      mailOutline,
      personOutline,
      school,
      shieldCheckmarkOutline
    });
  }

  async registrar(): Promise<void> {

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
      nombre,
      apellidos,
      correo,
      password
    } = this.form.getRawValue();

    try {

      await this.authService.registrar({
        nombre,
        apellidos,
        correo,
        password
      });

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

  registrarGoogle(): void {
    this.error.set(
      'El registro con Google todavía no está disponible.'
    );
  }

  registrarMicrosoft(): void {
    this.error.set(
      'El registro con Microsoft todavía no está disponible.'
    );
  }

  async irInicioSesion(): Promise<void> {
    await this.router.navigateByUrl('/login');
  }
}