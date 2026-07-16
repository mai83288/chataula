import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

import {
  IonCard,
  IonCardContent,
  IonCol,
  IonGrid,
  IonIcon,
  IonNote,
  IonRow,
  IonSpinner,
  IonText
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  bookOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-study',
  templateUrl: './study.page.html',
  styleUrls: ['./study.page.scss'],
  standalone: true,
  imports: [
    IonCard,
    IonCardContent,
    IonCol,
    IonContent,
    IonGrid,
    IonIcon,
    IonNote,
    IonRow,
    IonSpinner,
    IonText
  ]})
export class StudyPage implements OnInit {


  ngOnInit() {
  }


  constructor() {
    addIcons({
      bookOutline
    });
  }

}