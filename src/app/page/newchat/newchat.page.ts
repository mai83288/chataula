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

import {
  Router
} from '@angular/router';

import {
  IonAvatar,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

import {
  addIcons
} from 'ionicons';

import {
  addCircleOutline,
  checkmarkDoneCircleOutline,
  logOutOutline,
  peopleOutline,
  personCircleOutline,
  schoolOutline
} from 'ionicons/icons';

import {
  AuthService
} from '../../core/services/auth.service';

import {
  CategoriaSala,
  SalasService
} from '../../core/services/salas.service';

@Component({
  selector: 'app-newchat',
  templateUrl: './newchat.page.html',
  styleUrls: ['./newchat.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonAvatar,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonNote,
    IonRow,
    IonSelect,
    IonSelectOption,
    IonText,
    IonTextarea,
    IonTitle,
    IonToolbar
  ]
})
export class NewchatPage {

  private readonly fb =
    inject(NonNullableFormBuilder);

  private readonly router =
    inject(Router);

  private readonly salasService =
    inject(SalasService);

  private readonly authService =
    inject(AuthService);

  readonly error =
    signal<string | null>(null);

  readonly creando =
    signal(false);

  readonly cerrandoSesion =
    signal(false);

  readonly categorias:
    CategoriaSala[] = [
      'Académicas',
      'Social',
      'Urgente'
    ];

  readonly form = this.fb.group({
    nombre: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]
    ],

    descripcion: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000)
      ]
    ],

    categoria:
      this.fb.control<CategoriaSala>(
        'Académicas',
        {
          validators: [
            Validators.required
          ]
        }
      )
  });

  constructor() {

    addIcons({
      addCircleOutline,
      checkmarkDoneCircleOutline,
      logOutOutline,
      peopleOutline,
      personCircleOutline,
      schoolOutline
    });
  }

  async crearSala(): Promise<void> {

    this.error.set(null);
    this.form.markAllAsTouched();

    if (
      this.form.invalid ||
      this.creando()
    ) {
      return;
    }

    const {
      nombre,
      descripcion,
      categoria
    } = this.form.getRawValue();

    if (
      !nombre.trim() ||
      !descripcion.trim()
    ) {

      this.error.set(
        'El nombre y la descripción no pueden contener solamente espacios.'
      );

      return;
    }

    this.creando.set(true);

    try {

      const resultado =
        await this.salasService.crearSala({
          nombre,
          descripcion,
          categoria
        });

      this.form.reset({
        nombre: '',
        descripcion: '',
        categoria: 'Académicas'
      });

      /*
       * Abre directamente la sala
       * que acaba de crearse.
       */
      await this.router.navigate([
        '/chats/chatopen',
        resultado.salaId
      ]);

    } catch (error: unknown) {

      console.error(
        'Error al crear la sala:',
        error
      );

      this.error.set(
        this.obtenerMensajeError(error)
      );

    } finally {

      this.creando.set(false);
    }
  }

  async cancelar(): Promise<void> {

    if (this.creando()) {
      return;
    }

    this.form.reset({
      nombre: '',
      descripcion: '',
      categoria: 'Académicas'
    });

    await this.router.navigateByUrl(
      '/chats'
    );
  }

  async cerrarSesion(): Promise<void> {

    if (
      this.cerrandoSesion() ||
      this.creando()
    ) {
      return;
    }

    this.cerrandoSesion.set(true);
    this.error.set(null);

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
        'Error al cerrar sesión:',
        error
      );

      this.error.set(
        'No fue posible cerrar la sesión.'
      );

    } finally {

      this.cerrandoSesion.set(false);
    }
  }

  private obtenerMensajeError(
    error: unknown
  ): string {

    const codigo = (
      error as {
        code?: string;
      }
    )?.code;

    switch (codigo) {

      case 'permission-denied':
        return 'No tienes permiso para crear salas en esta aula.';

      case 'unavailable':
        return 'No fue posible conectarse con Firebase.';

      case 'unauthenticated':
        return 'Debes iniciar sesión nuevamente.';

      default:

        if (error instanceof Error) {
          return error.message;
        }

        return 'No fue posible crear la sala.';
    }
  }
}