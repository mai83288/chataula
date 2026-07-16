import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {  IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import {
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
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  peopleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.page.html',
  styleUrls: ['./groups.page.scss'],
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
export class GroupsPage implements OnInit {


  ngOnInit() {
  }



  constructor() {
    addIcons({
      peopleOutline
    });
  }

}
