import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: 'login',
    loadComponent: () =>
      import('./page/login/login.page')
        .then((m) => m.LoginPage)
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./page/register/register.page')
        .then((m) => m.RegisterPage)
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: '',
    loadComponent: () =>
      import('./layouts/tabs-layout/tabs-layout.component')
        .then((m) => m.TabsLayoutComponent),

    children: [

      {
        path: 'chats',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./page/chats/chats.page')
                .then((m) => m.ChatsPage)
          },
          {
            path: 'newchat',
            loadComponent: () =>
              import('./page/newchat/newchat.page')
                .then((m) => m.NewchatPage)
          },
          {
            path: 'infochat/:id',
            loadComponent: () =>
              import('./page/infochat/infochat.page')
                .then((m) => m.InfochatPage)
          },
          {
            path: 'chatopen/:id',
            loadComponent: () =>
              import('./page/chatopen/chatopen.page')
                .then((m) => m.ChatopenPage)
          }
        ]
      },

      {
        path: 'groups',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./page/groups/groups.page')
                .then((m) => m.GroupsPage)
          }
        ]
      },

      {
        path: 'study',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./page/study/study.page')
                .then((m) => m.StudyPage)
          }
        ]
      },

      {
        path: 'profile',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./page/profile/profile.page')
                .then((m) => m.ProfilePage)
          }
        ]
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];