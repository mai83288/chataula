import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  SearchbarInputEventDetail
} from '@ionic/core';

import {
  IonAvatar,
  IonBadge,
  IonButton,
  IonCard,
  IonChip,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRow,
  IonSearchbar,
  IonText,
  IonToolbar
} from '@ionic/angular/standalone';

import {
  addIcons
} from 'ionicons';

import {
  addOutline,
  bookOutline,
  chatboxEllipsesOutline,
  chatboxOutline,
  clipboardOutline,
  logOutOutline,
  megaphoneOutline,
  peopleOutline,
  personCircleOutline,
  personOutline,
  rocketOutline
} from 'ionicons/icons';

import {
  AuthService
} from '../../core/services/auth.service';

import {
  ChatSala,
  FiltroChat,
  SalasService
} from '../../core/services/salas.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonAvatar,
    IonBadge,
    IonButton,
    IonCard,
    IonChip,
    IonCol,
    IonContent,
    IonFab,
    IonFabButton,
    IonGrid,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonRow,
    IonSearchbar,
    IonText,
    IonToolbar
  ]
})
export class ChatsPage
  implements OnInit, OnDestroy {

  private readonly router =
    inject(Router);

  private readonly authService =
    inject(AuthService);

  private readonly salasService =
    inject(SalasService);

  private detenerEscucha:
    (() => void) | null = null;

  readonly correo =
    signal('');

  readonly aulaActualId =
    signal<string | null>(null);

  readonly busqueda =
    signal('');

  readonly filtroSeleccionado =
    signal<FiltroChat>('Todas');

  readonly cargando =
    signal(true);

  readonly cerrandoSesion =
    signal(false);

  readonly errorCarga =
    signal<string | null>(null);

  readonly chats =
    signal<ChatSala[]>([]);

  readonly filtros =
    signal<FiltroChat[]>([
      'Todas',
      'Académicas',
      'Social',
      'Urgente'
    ]);

  readonly chatsFiltrados = computed(() => {

    const filtro =
      this.filtroSeleccionado();

    const texto =
      this.busqueda()
        .trim()
        .toLowerCase();

    return this.chats().filter(chat => {

      const coincideCategoria =
        filtro === 'Todas' ||
        chat.categoria === filtro;

      const coincideBusqueda =
        chat.nombre
          .toLowerCase()
          .includes(texto) ||
        chat.mensaje
          .toLowerCase()
          .includes(texto);

      return (
        coincideCategoria &&
        coincideBusqueda
      );
    });
  });

  constructor() {
    addIcons({
      addOutline,
      bookOutline,
      chatboxEllipsesOutline,
      chatboxOutline,
      clipboardOutline,
      logOutOutline,
      megaphoneOutline,
      peopleOutline,
      personCircleOutline,
      personOutline,
      rocketOutline
    });
  }

  ngOnInit(): void {

    this.cargando.set(true);
    this.errorCarga.set(null);

    this.detenerEscucha =
      this.salasService.escucharSalasDelUsuario(

        estado => {

          if (!estado.autenticado) {

            this.chats.set([]);
            this.correo.set('');
            this.aulaActualId.set(null);
            this.cargando.set(false);

            void this.router.navigateByUrl(
              '/login',
              {
                replaceUrl: true
              }
            );

            return;
          }

          this.correo.set(
            estado.correo
          );

          this.aulaActualId.set(
            estado.aulaId
          );

          this.chats.set(
            estado.salas
          );

          this.errorCarga.set(null);
          this.cargando.set(false);
        },

        error => {

          console.error(
            'Error al cargar las salas:',
            error
          );

          this.errorCarga.set(
            'No fue posible cargar las salas.'
          );

          this.chats.set([]);
          this.cargando.set(false);
        }
      );
  }

  ngOnDestroy(): void {
    this.detenerEscucha?.();
    this.detenerEscucha = null;
  }

  actualizarBusqueda(
    event: CustomEvent<SearchbarInputEventDetail>
  ): void {

    this.busqueda.set(
      event.detail.value ?? ''
    );
  }

  seleccionarFiltro(
    filtro: FiltroChat
  ): void {

    this.filtroSeleccionado.set(filtro);
  }

  async abrirChat(
    id: string
  ): Promise<void> {

    await this.router.navigate(
      [
        'chats',
        'chatopen',
        id
      ]
    );
  }

  async cerrarSesion(): Promise<void> {

    if (this.cerrandoSesion()) {
      return;
    }

    this.cerrandoSesion.set(true);
    this.errorCarga.set(null);

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

      this.errorCarga.set(
        'No fue posible cerrar la sesión.'
      );

    } finally {

      this.cerrandoSesion.set(false);
    }
  }
}