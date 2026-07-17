import {
  Injectable,
  inject
} from '@angular/core';

import {
  Auth,
  UserCredential,
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from '@angular/fire/auth';

import {
  Firestore,
  doc,
  serverTimestamp,
  setDoc
} from '@angular/fire/firestore';

import type { User } from 'firebase/auth';

export interface DatosRegistro {
  nombre: string;
  apellidos: string;
  correo: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);

  async registrar(
    datos: DatosRegistro
  ): Promise<UserCredential> {

    const nombre = datos.nombre.trim();
    const apellidos = datos.apellidos.trim();

    const correo = datos.correo
      .trim()
      .toLowerCase();

    const nombreCompleto = `${nombre} ${apellidos}`.trim();

    const credencial =
      await createUserWithEmailAndPassword(
        this.auth,
        correo,
        datos.password
      );

    try {

      await updateProfile(
        credencial.user,
        {
          displayName: nombreCompleto
        }
      );

      const referenciaUsuario = doc(
        this.firestore,
        'usuarios',
        credencial.user.uid
      );

      await setDoc(
        referenciaUsuario,
        {
          uid: credencial.user.uid,
          nombre,
          apellidos,
          nombreCompleto,
          correo,
          fotoUrl: null,
          aulaActualId: null,
          activo: true,
          creadoEn: serverTimestamp()
        }
      );

      return credencial;

    } catch (error: unknown) {

      /*
       * Evita dejar una cuenta en Authentication
       * sin su correspondiente perfil en Firestore.
       */
      try {
        await deleteUser(credencial.user);
      } catch (deleteError: unknown) {
        console.error(
          'No fue posible revertir el usuario:',
          deleteError
        );
      }

      throw error;
    }
  }

  obtenerMensajeError(error: unknown): string {

    const codigo = (
        error as {
        code?: string;
        }
    )?.code;

    switch (codigo) {

        case 'auth/email-already-in-use':
        return 'Este correo ya está registrado.';

        case 'auth/invalid-email':
        return 'El correo electrónico no es válido.';

        case 'auth/weak-password':
        return 'La contraseña no cumple con los requisitos de seguridad.';

        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        return 'El correo o la contraseña son incorrectos.';

        case 'auth/user-disabled':
        return 'Esta cuenta fue desactivada.';

        case 'auth/missing-password':
        return 'Ingresa tu contraseña.';

        case 'auth/operation-not-allowed':
        return 'El acceso con correo y contraseña no está habilitado.';

        case 'auth/network-request-failed':
        return 'No fue posible conectarse. Revisa tu conexión a internet.';

        case 'auth/too-many-requests':
        return 'Se realizaron demasiados intentos. Inténtalo más tarde.';

        case 'permission-denied':
        return 'No tienes permisos para realizar esta operación.';

        default:
        console.error(
            'Error de Firebase:',
            error
        );

        return 'Ocurrió un error inesperado. Inténtalo nuevamente.';
    }
    }

  async iniciarSesion(
    correo: string,
    password: string
    ): Promise<UserCredential> {

    const correoNormalizado = correo
        .trim()
        .toLowerCase();

    return signInWithEmailAndPassword(
        this.auth,
        correoNormalizado,
        password
    );
    }

    async cerrarSesion(): Promise<void> {
    await signOut(this.auth);
    }

    obtenerUsuarioActual(): User | null {
    return this.auth.currentUser;
    }
}