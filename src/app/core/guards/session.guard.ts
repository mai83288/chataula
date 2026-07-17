import {
  inject
} from '@angular/core';

import {
  Auth
} from '@angular/fire/auth';

import {
  CanActivateChildFn,
  CanActivateFn,
  Router,
  UrlTree
} from '@angular/router';

import {
  onAuthStateChanged
} from 'firebase/auth';

import type {
  User
} from 'firebase/auth';

/**
 * Espera a que Firebase termine de restaurar
 * o comprobar la sesión guardada.
 */
function esperarEstadoSesion(
  auth: Auth
): Promise<User | null> {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      let detenerEscucha:
        (() => void) | null = null;

      detenerEscucha =
        onAuthStateChanged(
          auth,

          usuario => {

            detenerEscucha?.();

            resolve(usuario);
          },

          error => {

            detenerEscucha?.();

            reject(error);
          }
        );
    }
  );
}

/**
 * Comprueba si la ruta requiere o prohíbe
 * una sesión activa.
 */
async function validarAcceso(
  requiereSesion: boolean
): Promise<boolean | UrlTree> {

  const auth =
    inject(Auth);

  const router =
    inject(Router);

  try {

    const usuario =
      await esperarEstadoSesion(auth);

    /*
     * Rutas privadas:
     *
     * - Con usuario: permitir.
     * - Sin usuario: enviar a login.
     */
    if (requiereSesion) {

      return usuario
        ? true
        : router.createUrlTree([
            '/login'
          ]);
    }

    /*
     * Rutas para invitados:
     *
     * - Sin usuario: permitir.
     * - Con usuario: enviar a chats.
     */
    return usuario
      ? router.createUrlTree([
          '/chats'
        ])
      : true;

  } catch (error: unknown) {

    console.error(
      'No fue posible comprobar la sesión:',
      error
    );

    /*
     * Ante un error:
     *
     * - Las páginas privadas se bloquean.
     * - Login y registro permanecen disponibles.
     */
    return requiereSesion
      ? router.createUrlTree([
          '/login'
        ])
      : true;
  }
}

/**
 * Protege todas las páginas dentro
 * del layout principal.
 */
export const authChildGuard:
  CanActivateChildFn = () => {

    return validarAcceso(true);
  };

/**
 * Impide entrar a login y registro
 * cuando ya existe una sesión.
 */
export const guestGuard:
  CanActivateFn = () => {

    return validarAcceso(false);
  };