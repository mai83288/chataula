import { Component, OnInit,  computed,  inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { SearchbarInputEventDetail } from '@ionic/core';
import {
  IonAvatar,
  IonBadge,
  IonButton,
  IonCard,
  IonChip,
  IonCol,
  IonFab,
  IonFabButton,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRow,
  IonSearchbar,
  IonText
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

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

type FiltroChat = 'Todas' | 'Académicas' | 'Social' | 'Urgente';

interface Chat {
  id: number;
  nombre: string;
  mensaje: string;
  hora: string;
  categoria: Exclude<FiltroChat, 'Todas'>;
  icono: string;
  color: string;
  fondoIcono: string;
  mensajesNoLeidos: number;
}

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, CommonModule, FormsModule,  IonAvatar,
  IonBadge,
  IonButton,
  IonCard,
  IonChip,
  IonCol,
  IonFab,
  IonFabButton,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRow,
  IonSearchbar,
  RouterLink,

  IonText]
})
export class ChatsPage implements OnInit {
  
  
  constructor(){
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

  ngOnInit() {
  }

  private readonly router = inject(Router);

  readonly busqueda = signal('');
  readonly filtroSeleccionado = signal<FiltroChat>('Todas');

  readonly filtros = signal<FiltroChat[]>([
    'Todas',
    'Académicas',
    'Social',
    'Urgente'
  ]);

  /*
   * Mini base de datos temporal.
   * Después estos datos podrán obtenerse desde un servicio.
   */
  readonly chats = signal<Chat[]>([
    {
      id: 1,
      nombre: 'General',
      mensaje: '¿Alguien tiene el link?',
      hora: '10:30 AM',
      categoria: 'Social',
      icono: 'chatbox-outline',
      color: '#075bcc',
      fondoIcono: '#b8c7ff',
      mensajesNoLeidos: 3
    },
    {
      id: 2,
      nombre: 'Tareas',
      mensaje: 'Recuerden subir la evidencia',
      hora: '09:15 AM',
      categoria: 'Académicas',
      icono: 'clipboard-outline',
      color: '#00865a',
      fondoIcono: '#74f1bc',
      mensajesNoLeidos: 0
    },
    {
      id: 3,
      nombre: 'Proyecto final',
      mensaje: 'Firebase ya quedó listo',
      hora: 'Ayer',
      categoria: 'Académicas',
      icono: 'rocket-outline',
      color: '#b5480a',
      fondoIcono: '#ffd4c3',
      mensajesNoLeidos: 0
    },
    {
      id: 4,
      nombre: 'Avisos',
      mensaje: 'Clase cancelada el viernes',
      hora: 'Lunes',
      categoria: 'Urgente',
      icono: 'megaphone-outline',
      color: '#d7192d',
      fondoIcono: '#ffd1d7',
      mensajesNoLeidos: 0
    }
  ]);

  readonly chatsFiltrados = computed(() => {
    const filtro = this.filtroSeleccionado();
    const texto = this.busqueda().trim().toLowerCase();

    return this.chats().filter(chat => {

      const coincideCategoria =
        filtro === 'Todas' ||
        chat.categoria === filtro;

      const coincideBusqueda =
        chat.nombre.toLowerCase().includes(texto) ||
        chat.mensaje.toLowerCase().includes(texto);

      return coincideCategoria && coincideBusqueda;
    });
  });

  actualizarBusqueda(
    event: CustomEvent<SearchbarInputEventDetail>
  ): void {
    this.busqueda.set(event.detail.value ?? '');
  }

  seleccionarFiltro(filtro: FiltroChat): void {
    this.filtroSeleccionado.set(filtro);
  }

  async abrirChat(id: number): Promise<void> {
    await this.router.navigate(['chats/chatopen', id]);
  }
}