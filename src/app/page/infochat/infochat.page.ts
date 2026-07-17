
import {
  Component,
  computed,
  inject,
  signal,OnInit
} from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';

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
  IonGrid,
  IonHeader,
  IonIcon,
  IonNote,
  IonProgressBar,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  calendarOutline,
  chatboxEllipsesOutline,
  chatbubblesOutline,
  informationCircleOutline,
  mailOutline,
  personCircleOutline,
  schoolOutline,
  statsChartOutline
} from 'ionicons/icons';

interface InformacionSala {
  id: number;
  nombre: string;
  creador: string;
  imagen: string;
  descripcion: string;
  mensajesTotales: number;
  popularidad: number;
  popularidadTexto: string;
  fechaCreacion: string;
  cicloEscolar: string;
  administrador: string;
  cargoAdministrador: string;
}
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
    IonNote,
    IonProgressBar,
    IonRow,
    IonText,
    IonTitle,
    IonToolbar
  ]
})
export class InfochatPage implements OnInit {


  ngOnInit() {
  }


  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly parametros = toSignal(
    this.route.paramMap,
    {
      initialValue: this.route.snapshot.paramMap
    }
  );

  readonly salas = signal<InformacionSala[]>([
    {
      id: 1,
      nombre: 'General',
      creador: 'Prof. Martínez',
      imagen: 'assets/img/sala-general.jpg',
      descripcion:
        'Espacio para consultas generales sobre la materia y el aula. Un lugar dinámico para compartir dudas, anuncios importantes y coordinar actividades académicas.',
      mensajesTotales: 154,
      popularidad: 1,
      popularidadTexto: 'Alta',
      fechaCreacion: '15 de Octubre, 2023',
      cicloEscolar: 'Ciclo Lectivo 2023',
      administrador: 'Prof. Martínez',
      cargoAdministrador: 'Administrador del Aula'
    }
  ]);

  readonly salaId = computed(() => {
    const id = Number(this.parametros().get('id'));

    return Number.isNaN(id)
      ? 0
      : id;
  });

  readonly salaActual = computed(() =>
    this.salas().find(
      sala => sala.id === this.salaId()
    ) ?? null
  );

  constructor() {
    addIcons({
      calendarOutline,
      chatboxEllipsesOutline,
      informationCircleOutline,
      mailOutline,
      personCircleOutline,
      schoolOutline,
      statsChartOutline,
      chatbubblesOutline
    });
  }

  async volverAlChat(): Promise<void> {
    await this.router.navigate([
      'chats/chatopen',
      this.salaId()
    ]);
  }

  contactarAdministrador(): void {
    console.log(
      'Contactar administrador:',
      this.salaActual()?.administrador
    );
  }
}
