
import {
  Component,
  inject,
  signal, OnInit
} from '@angular/core';

import { Router } from '@angular/router';

import {
  IonAvatar,
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
  IonRow,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  checkmarkCircle,
  logOutOutline,
  mail,
  personCircleOutline,
  powerOutline,
  schoolOutline,
  shieldCheckmark
} from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonAvatar,
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
    IonRow,
    IonText,
    IonTitle,
    IonToolbar
  ]})
export class ProfilePage implements OnInit {

  ngOnInit() {
  }

  private readonly router = inject(Router);

  readonly correo = signal('alumno@correo.com');

  readonly seguridad = signal(
    'Sesión iniciada con Firebase Auth'
  );

  readonly version = signal(
    'Chat Aula v2.4.0 · Academic Ecosystem'
  );

  constructor() {
    addIcons({
      checkmarkCircle,
      logOutOutline,
      mail,
      personCircleOutline,
      powerOutline,
      schoolOutline,
      shieldCheckmark
    });
  }

  async cerrarSesion(): Promise<void> {
    /*
     * Posteriormente aquí se ejecutará el método
     * del servicio de autenticación.
     */

    await this.router.navigate(['/login']);
  }
}