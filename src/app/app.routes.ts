import {
  Routes
} from '@angular/router';

import {
  authChildGuard,
  guestGuard
} from './core/guards/session.guard';

export const routes: Routes = [

  /*
   * Solo usuarios sin sesión.
   */
  {
    path: 'login',

    canActivate: [
      guestGuard
    ],

    loadComponent: () =>
      import('./page/login/login.page')
        .then(
          m => m.LoginPage
        )
  },

  /*
   * Solo usuarios sin sesión.
   */
  {
    path: 'register',

    canActivate: [
      guestGuard
    ],

    loadComponent: () =>
      import('./page/register/register.page')
        .then(
          m => m.RegisterPage
        )
  },

  /*
   * Al entrar a la raíz:
   *
   * - Sin sesión: permanecerá en login.
   * - Con sesión: guestGuard enviará a chats.
   */
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  /*
   * Todas las páginas dentro del layout
   * requieren una sesión activa.
   */
  {
    path: '',

    canActivateChild: [
      authChildGuard
    ],

    loadComponent: () =>
      import(
        './layouts/tabs-layout/tabs-layout.component'
      )
        .then(
          m => m.TabsLayoutComponent
        ),

    children: [

      {
        path: 'chats',

        children: [

          {
            path: '',

            loadComponent: () =>
              import(
                './page/chats/chats.page'
              )
                .then(
                  m => m.ChatsPage
                )
          },

          {
            path: 'newchat',

            loadComponent: () =>
              import(
                './page/newchat/newchat.page'
              )
                .then(
                  m => m.NewchatPage
                )
          },

          {
            path: 'infochat/:id',

            loadComponent: () =>
              import(
                './page/infochat/infochat.page'
              )
                .then(
                  m => m.InfochatPage
                )
          },

          {
            path: 'chatopen/:id',

            loadComponent: () =>
              import(
                './page/chatopen/chatopen.page'
              )
                .then(
                  m => m.ChatopenPage
                )
          }
        ]
      },

      {
        path: 'groups',

        children: [

          {
            path: '',

            loadComponent: () =>
              import(
                './page/groups/groups.page'
              )
                .then(
                  m => m.GroupsPage
                )
          }
        ]
      },

      {
        path: 'study',

        children: [

          {
            path: '',

            loadComponent: () =>
              import(
                './page/study/study.page'
              )
                .then(
                  m => m.StudyPage
                )
          }
        ]
      },

      {
        path: 'profile',

        children: [

          {
            path: '',

            loadComponent: () =>
              import(
                './page/profile/profile.page'
              )
                .then(
                  m => m.ProfilePage
                )
          }
        ]
      }
    ]
  },

  /*
   * URL inexistente:
   *
   * - Sin sesión: login.
   * - Con sesión: login intentará abrirse,
   *   pero guestGuard enviará a chats.
   */
  {
    path: '**',
    redirectTo: 'login'
  }
];