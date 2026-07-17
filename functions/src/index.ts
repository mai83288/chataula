import {
  HttpsError,
  onCall
} from 'firebase-functions/v2/https';

import {
  initializeApp
} from 'firebase-admin/app';

import {
  getFirestore
} from 'firebase-admin/firestore';

initializeApp();

export const eliminarSala = onCall(
  {
    region: 'us-central1'
  },
  async request => {

    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'Debes iniciar sesión.'
      );
    }

    const datos = request.data;

    const aulaId =
      typeof datos?.aulaId === 'string'
        ? datos.aulaId.trim()
        : '';

    const salaId =
      typeof datos?.salaId === 'string'
        ? datos.salaId.trim()
        : '';

    if (!aulaId || !salaId) {
      throw new HttpsError(
        'invalid-argument',
        'Faltan los identificadores del aula o la sala.'
      );
    }

    if (
      aulaId.includes('/') ||
      salaId.includes('/')
    ) {
      throw new HttpsError(
        'invalid-argument',
        'Los identificadores no son válidos.'
      );
    }

    const firestore =
      getFirestore();

    const referenciaSala =
      firestore
        .collection('aulas')
        .doc(aulaId)
        .collection('salas')
        .doc(salaId);

    const documentoSala =
      await referenciaSala.get();

    if (!documentoSala.exists) {
      throw new HttpsError(
        'not-found',
        'La sala no existe.'
      );
    }

    const creadorId =
      documentoSala.get('creadorId');

    if (
      typeof creadorId !== 'string' ||
      creadorId !== request.auth.uid
    ) {
      throw new HttpsError(
        'permission-denied',
        'Únicamente el creador puede eliminar esta sala.'
      );
    }

    /*
     * Impide que los clientes sigan enviando mensajes
     * mientras comienza la eliminación.
     */
    await referenciaSala.update({
      activa: false,
      eliminando: true
    });

    /*
     * Elimina el documento de la sala y todo lo que
     * exista debajo:
     *
     * - mensajes
     * - lecturas
     * - cualquier futura subcolección
     */
    await firestore.recursiveDelete(
      referenciaSala
    );

    return {
      ok: true
    };
  }
);