import { Component, inject, signal, OnInit } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

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
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  addCircleOutline,
  checkmarkDoneCircleOutline,
  logOutOutline,
  peopleOutline,
  personCircleOutline,
  schoolOutline
} from 'ionicons/icons';

interface NuevaSala {
  nombre: string;
  descripcion: string;
}

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
    IonText,
    IonTextarea,
    IonTitle,
    IonToolbar
  ]
})
export class NewchatPage implements OnInit {

  //constructor() { }

  ngOnInit() {
  }


  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);

  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    nombre: [
      '',
      [
        Validators.required,
        Validators.minLength(3)
      ]
    ],
    descripcion: [
      '',
      [
        Validators.required,
        Validators.minLength(10)
      ]
    ]
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);

    const nuevaSala: NuevaSala = this.form.getRawValue();

    try {
      console.log('Sala creada:', nuevaSala);

      this.form.reset();

      await this.router.navigate(['../chats']);

    } catch (error: unknown) {
      const mensaje =
        error instanceof Error
          ? error.message
          : 'No fue posible crear la sala';

      this.error.set(mensaje);
    }
  }

  async cancelar(): Promise<void> {
    this.form.reset();
    await this.router.navigate(['../chats']);
  }
}
