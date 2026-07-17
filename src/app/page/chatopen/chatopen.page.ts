import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal
} from '@angular/core';

import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
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
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
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
  personCircleOutline,
  sendOutline
} from 'ionicons/icons';

import {
  MensajeChat,
  MensajesService
} from '../../core/services/mensajes.service';

@Component({
  selector: 'app-chatopen',
  templateUrl: './chatopen.page.html',
  styleUrls: ['./chatopen.page.scss'],
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
    IonFooter,
    IonGrid,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonList,
    IonNote,
    IonRow,
    IonText,
    IonTitle,
    IonToolbar
  ]
})
export class ChatopenPage
  implements OnInit, OnDestroy {

  @ViewChild(IonContent)
  private contenidoChat?: IonContent;

  private readonly fb =
    inject(NonNullableFormBuilder);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly mensajesService =
    inject(MensajesService);

  private detenerEscucha:
    (() => void) | null = null;

  readonly salaId =
    signal<string | null>(null);

  readonly aulaId =
    signal<string | null>(null);

  readonly nombreUsuario =
    signal('');

  readonly nombreSala =
    signal('Sala');

  readonly estadoSala =
    signal('');

  readonly salaExiste =
    signal(false);

  readonly salaActiva =
    signal(false);

  readonly cargando =
    signal(true);

  readonly enviando =
    signal(false);

  readonly error =
    signal<string | null>(null);

  readonly mensajes =
    signal<MensajeChat[]>([]);

  readonly form = this.fb.group({
    texto: [
      '',
      [
        Validators.required,
        Validators.maxLength(2000)
      ]
    ]
  });

  constructor() {
    addIcons({
      personCircleOutline,
      sendOutline
    });
  }

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap
        .get('id')
        ?.trim();

    if (!id) {

      this.cargando.set(false);

      this.error.set(
        'No se recibió el identificador de la sala.'
      );

      return;
    }

    this.salaId.set(id);
    this.cargando.set(true);
    this.error.set(null);

    this.detenerEscucha =
      this.mensajesService.escucharChat(

        id,

        estado => {

          if (!estado.autenticado) {

            void this.router.navigateByUrl(
              '/login',
              {
                replaceUrl: true
              }
            );

            return;
          }

          const mensajesAnteriores =
            this.mensajes();

          const ultimoMensajeAnterior =
            mensajesAnteriores.length > 0
              ? mensajesAnteriores[
                  mensajesAnteriores.length - 1
                ].id
              : undefined;

          this.aulaId.set(
            estado.aulaId
          );

          this.nombreUsuario.set(
            estado.nombreUsuario
          );

          this.nombreSala.set(
            estado.nombreSala
          );

          this.estadoSala.set(
            estado.estadoSala
          );

          this.salaExiste.set(
            estado.salaExiste
          );

          this.salaActiva.set(
            estado.salaActiva
          );

          this.mensajes.set(
            estado.mensajes
          );

          this.cargando.set(
            estado.cargando
          );

          this.error.set(null);

          const ultimoMensajeNuevo =
            estado.mensajes.length > 0
              ? estado.mensajes[
                  estado.mensajes.length - 1
                ].id
              : undefined;

          if (
            ultimoMensajeNuevo &&
            ultimoMensajeNuevo !==
              ultimoMensajeAnterior
          ) {
            this.bajarAlFinal();
          }
        },

        error => {

          console.error(
            'Error al cargar el chat:',
            error
          );

          this.cargando.set(false);

          this.error.set(
            this.obtenerMensajeError(error)
          );
        }
      );
  }

  ngOnDestroy(): void {

    this.detenerEscucha?.();
    this.detenerEscucha = null;
  }

  async enviarMensaje(): Promise<void> {

    this.error.set(null);
    this.form.markAllAsTouched();

    if (
      this.form.invalid ||
      this.enviando() ||
      !this.salaActiva()
    ) {
      return;
    }

    const texto =
      this.form.controls.texto.value.trim();

    const aulaId =
      this.aulaId();

    const salaId =
      this.salaId();

    if (
      !texto ||
      !aulaId ||
      !salaId
    ) {
      return;
    }

    this.enviando.set(true);

    try {

      await this.mensajesService.enviarMensaje(
        aulaId,
        salaId,
        this.nombreUsuario(),
        texto
      );

      this.form.reset();

      this.bajarAlFinal();

    } catch (error: unknown) {

      console.error(
        'Error al enviar el mensaje:',
        error
      );

      this.error.set(
        this.obtenerMensajeError(error)
      );

    } finally {

      this.enviando.set(false);
    }
  }

  async regresar(): Promise<void> {

    await this.router.navigateByUrl(
      '/chats'
    );
  }

  async verInformacionSala(): Promise<void> {

    const salaId =
      this.salaId();

    if (!salaId) {
      return;
    }

    await this.router.navigate([
      'chats',
      'infochat',
      salaId
    ]);
  }

  private bajarAlFinal(): void {

    setTimeout(() => {

      void this.contenidoChat
        ?.scrollToBottom(250);

    }, 80);
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
        return 'No tienes permiso para acceder a esta sala.';

      case 'unavailable':
        return 'No fue posible conectarse con Firebase.';

      case 'failed-precondition':
        return 'La sala todavía no está configurada correctamente.';

      default:

        if (error instanceof Error) {
          return error.message;
        }

        return 'Ocurrió un error al cargar el chat.';
    }
  }
}