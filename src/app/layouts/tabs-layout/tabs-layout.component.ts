import {
  Component,
  inject
} from '@angular/core';

import { Router } from '@angular/router';

import {
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  bookOutline,
  chatboxEllipsesOutline,
  peopleOutline,
  personOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs-layout',
  standalone: true,
  templateUrl: './tabs-layout.component.html',
  styleUrls: ['./tabs-layout.component.scss'],
  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
 
]
})
export class TabsLayoutComponent {

  private readonly router = inject(Router);

  readonly rutas = {
    chats: '/chats',
    groups: '/groups',
    study: '/study',
    profile: '/profile'
  } as const;

  constructor() {
    addIcons({
      bookOutline,
      chatboxEllipsesOutline,
      peopleOutline,
      personOutline
    });
  }

  

}