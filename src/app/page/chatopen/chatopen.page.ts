import {
  Component,
  inject,
  OnInit,
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

import { addIcons } from 'ionicons';

import {
  personCircleOutline,
  sendOutline
} from 'ionicons/icons';

interface MensajeChat {
  id: number;
  autor: string;
  contenido: string;
  hora: string;
  esMio: boolean;
  colorBorde?: string;
}


@Component({
  selector: 'app-chatopen',
  templateUrl: './chatopen.page.html',
  styleUrls: ['./chatopen.page.scss'],
  standalone: true,
  imports: [ ReactiveFormsModule,
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
    IonToolbar]
})
export class ChatopenPage implements OnInit {


  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly salaId = signal<number | null>(null);

  readonly nombreSala = signal(this.salaId);
  readonly estadoSala = signal('');

  /*
   * Lista vacía.
   * Después podrá llenarse desde un servicio o base de datos.
   */
  readonly mensajes = signal<MensajeChat[]>([]);

  readonly form = this.fb.group({
    texto: ['', [Validators.required]]
  });

  constructor() {
    addIcons({
      personCircleOutline,
      sendOutline
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.salaId.set(
      Number.isNaN(id)
        ? null
        : id
    );
  }

  enviarMensaje(): void {
    if (this.form.invalid) {
      return;
    }

    const texto = this.form.controls.texto.value.trim();

    if (!texto) {
      return;
    }

    const nuevoMensaje: MensajeChat = {
      id: Date.now(),
      autor: '',
      contenido: texto,
      hora: this.obtenerHoraActual(),
      esMio: true
    };

    this.mensajes.update(mensajes => [
      ...mensajes,
      nuevoMensaje
    ]);

    this.form.reset();
  }

  private obtenerHoraActual(): string {
    return new Intl.DateTimeFormat('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());
  }

  async regresar(): Promise<void> {
    await this.router.navigate(['/chats']);
  }
  async verInformacionSala(): Promise<void> {
  await this.router.navigate([
    'chats/infochat',
    this.salaId()
  ]);
} 
}

//bajar el ion footer cuando le pongas los tabs