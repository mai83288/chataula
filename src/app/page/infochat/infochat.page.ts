import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  AlertController
} from '@ionic/angular';

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
  IonImg,
  IonNote,
  IonProgressBar,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

import {
  addIcons
} from 'ionicons';

import {
  calendarOutline,
  chatboxEllipsesOutline,
  chatbubblesOutline,
  informationCircleOutline,
  mailOutline,
  personCircleOutline,
  schoolOutline,
  statsChartOutline,
  trashOutline
} from 'ionicons/icons';

import {
  InformacionSala,
  InfoSalaService
} from '../../core/services/info-sala.service';

@Component({
  selector: 'app-infochat',
  templateUrl: './infochat.page.html',
  styleUrls: ['./infochat.page.scss'],
  standalone: true,
  imports: [
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
    IonImg,
    IonNote,
    IonProgressBar,
    IonRow,
    IonText,
    IonTitle,
    IonToolbar
  ]
})
export class InfochatPage
  implements OnInit, OnDestroy {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly alertController =
    inject(AlertController);

  private readonly infoSalaService =
    inject(InfoSalaService);

  private detenerEscucha:
    (() => void) | null = null;

  readonly salaId =
    signal<string | null>(null);

  readonly aulaId =
    signal<string | null>(null);

  readonly salaActual =
    signal<InformacionSala | null>(null);

  readonly cargando =
    signal(true);

  readonly eliminando =
    signal(false);

  readonly error =
    signal<string | null>(null);

  readonly mensajeEstado =
    signal('');

  constructor() {

    addIcons({
      calendarOutline,
      chatboxEllipsesOutline,
      chatbubblesOutline,
      informationCircleOutline,
      mailOutline,
      personCircleOutline,
      schoolOutline,
      statsChartOutline,
      trashOutline
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
      this.infoSalaService
        .escucharInformacionSala(

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

            this.aulaId.set(
              estado.aulaId
            );

            this.salaActual.set(
              estado.sala
            );

            this.mensajeEstado.set(
              estado.mensajeEstado
            );

            this.cargando.set(
              estado.cargando
            );

            this.error.set(null);
          },

          error => {

            console.error(
              'Error al cargar la información:',
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

  async volverAlChat(): Promise<void> {

    const id =
      this.salaId();

    if (!id) {
      return;
    }

    await this.router.navigate([
      '/chats/chatopen',
      id
    ]);
  }

  /**
   * El creador es también el administrador.
   */
  contactarAdministrador(): void {

    const sala =
      this.salaActual();

    if (!sala) {
      return;
    }

    const correo =
      sala.creadorCorreo.trim();

    if (
      !correo ||
      !this.correoValido(correo)
    ) {

      this.error.set(
        'El administrador no tiene un correo de contacto registrado.'
      );

      return;
    }

    this.error.set(null);

    const asunto =
      encodeURIComponent(
        `Consulta sobre la sala ${sala.nombre}`
      );

    const cuerpo =
      encodeURIComponent(
        `Hola ${sala.creadorNombre},\n\n` +
        'Tengo una consulta relacionada con la sala ' +
        `"${sala.nombre}".\n\n`
      );

    window.location.href =
      `mailto:${correo}` +
      `?subject=${asunto}` +
      `&body=${cuerpo}`;
  }

  async confirmarEliminarSala(): Promise<void> {

    const sala =
      this.salaActual();

    const aulaId =
      this.aulaId();

    const salaId =
      this.salaId();

    if (
      !sala ||
      !aulaId ||
      !salaId ||
      !sala.esCreador ||
      this.eliminando()
    ) {
      return;
    }

    const alerta =
      await this.alertController.create({
        header: 'Eliminar sala',

        message:
          `Se eliminará "${sala.nombre}" junto con ` +
          'todos sus mensajes y datos. ' +
          'Esta acción no se puede deshacer.',

        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Eliminar',
            role: 'confirm'
          }
        ]
      });

    await alerta.present();

    const resultado =
      await alerta.onDidDismiss();

    if (resultado.role !== 'confirm') {
      return;
    }

    this.eliminando.set(true);
    this.error.set(null);

    try {

      await this.infoSalaService.eliminarSala(
        aulaId,
        salaId
      );

      await this.router.navigateByUrl(
        '/chats',
        {
          replaceUrl: true
        }
      );

    } catch (error: unknown) {

      console.error(
        'Error al eliminar la sala:',
        error
      );

      this.error.set(
        this.obtenerMensajeErrorEliminacion(
          error
        )
      );

    } finally {

      this.eliminando.set(false);
    }
  }

  private correoValido(
    correo: string
  ): boolean {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(correo);
  }

  private obtenerMensajeErrorEliminacion(
    error: unknown
  ): string {

    const codigo = (
      error as {
        code?: string;
      }
    )?.code;

    switch (codigo) {

      case 'permission-denied':
        return 'Únicamente el creador puede eliminar esta sala.';

      case 'unavailable':
        return 'No fue posible conectarse con Firebase.';

      default:

        if (error instanceof Error) {
          return error.message;
        }

        return 'No fue posible eliminar la sala.';
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
        return 'No tienes permiso para consultar esta sala.';

      case 'unavailable':
        return 'No fue posible conectarse con Firebase.';

      default:

        if (error instanceof Error) {
          return error.message;
        }

        return 'No fue posible cargar la información de la sala.';
    }
  }
}