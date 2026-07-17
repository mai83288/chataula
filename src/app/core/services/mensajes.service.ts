import {
  Injectable,
  NgZone,
  inject
} from '@angular/core';

import {
  Auth
} from '@angular/fire/auth';

import {
  Firestore
} from '@angular/fire/firestore';

import {
  onAuthStateChanged
} from 'firebase/auth';

import {
  DocumentData,
  collection,
  doc,
  increment,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

export interface MensajeChat {
  id: string;
  autorId: string;
  autor: string;
  contenido: string;
  hora: string;
  esMio: boolean;
  colorBorde?: string;
}

export interface EstadoChat {
  autenticado: boolean;
  cargando: boolean;

  aulaId: string | null;
  usuarioId: string;
  nombreUsuario: string;

  salaExiste: boolean;
  salaActiva: boolean;
  nombreSala: string;
  estadoSala: string;

  mensajes: MensajeChat[];
}

interface PerfilUsuario {
  nombre?: string;
  apellidos?: string;
  nombreCompleto?: string;
  correo?: string;
  aulaActualId?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class MensajesService {

  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly zone = inject(NgZone);

  escucharChat(
    salaId: string,
    alActualizar: (estado: EstadoChat) => void,
    alOcurrirError: (error: unknown) => void
  ): () => void {

    let detenerPerfil: (() => void) | null = null;
    let detenerSala: (() => void) | null = null;
    let detenerMensajes: (() => void) | null = null;

    let perfilCargado = false;
    let salaCargada = false;
    let mensajesCargados = false;

    const estado: EstadoChat = {
      autenticado: false,
      cargando: true,

      aulaId: null,
      usuarioId: '',
      nombreUsuario: '',

      salaExiste: false,
      salaActiva: false,
      nombreSala: 'Sala',
      estadoSala: '',

      mensajes: []
    };

    const emitirEstado = (): void => {

      estado.cargando =
        !perfilCargado ||
        (
          estado.aulaId !== null &&
          (
            !salaCargada ||
            !mensajesCargados
          )
        );

      this.zone.run(() => {
        alActualizar({
          ...estado,
          mensajes: [...estado.mensajes]
        });
      });
    };

    const limpiarEscuchasSala = (): void => {
      detenerSala?.();
      detenerMensajes?.();

      detenerSala = null;
      detenerMensajes = null;

      salaCargada = false;
      mensajesCargados = false;
    };

    const detenerAutenticacion = onAuthStateChanged(
      this.auth,

      usuario => {

        detenerPerfil?.();
        detenerPerfil = null;

        limpiarEscuchasSala();

        perfilCargado = false;

        if (!usuario) {

          estado.autenticado = false;
          estado.cargando = false;
          estado.aulaId = null;
          estado.usuarioId = '';
          estado.nombreUsuario = '';
          estado.mensajes = [];

          emitirEstado();
          return;
        }

        estado.autenticado = true;
        estado.usuarioId = usuario.uid;

        const referenciaPerfil = doc(
          this.firestore,
          'usuarios',
          usuario.uid
        );

        detenerPerfil = onSnapshot(
          referenciaPerfil,

          documentoPerfil => {

            limpiarEscuchasSala();

            perfilCargado = true;

            if (!documentoPerfil.exists()) {

              this.zone.run(() => {
                alOcurrirError(
                  new Error(
                    'No se encontró el perfil del usuario.'
                  )
                );
              });

              return;
            }

            const perfil =
              documentoPerfil.data() as PerfilUsuario;

            const nombreCompleto =
              perfil.nombreCompleto?.trim() ||
              [
                perfil.nombre,
                perfil.apellidos
              ]
                .filter(Boolean)
                .join(' ')
                .trim() ||
              usuario.displayName?.trim() ||
              usuario.email ||
              'Estudiante';

            const aulaId =
              typeof perfil.aulaActualId === 'string' &&
              perfil.aulaActualId.trim()
                ? perfil.aulaActualId.trim()
                : null;

            estado.nombreUsuario = nombreCompleto;
            estado.aulaId = aulaId;

            if (!aulaId) {

              estado.salaExiste = false;
              estado.salaActiva = false;
              estado.nombreSala = 'Sala';
              estado.estadoSala =
                'Tu cuenta no pertenece a un aula';
              estado.mensajes = [];

              emitirEstado();
              return;
            }

            const referenciaSala = doc(
              this.firestore,
              'aulas',
              aulaId,
              'salas',
              salaId
            );

            detenerSala = onSnapshot(
              referenciaSala,

              documentoSala => {

                salaCargada = true;

                if (!documentoSala.exists()) {

                  estado.salaExiste = false;
                  estado.salaActiva = false;
                  estado.nombreSala =
                    'Sala no encontrada';
                  estado.estadoSala = '';
                  estado.mensajes = [];

                  emitirEstado();
                  return;
                }

                const datosSala =
                  documentoSala.data();

                estado.salaExiste = true;
                estado.salaActiva =
                  datosSala['activa'] !== false;

                estado.nombreSala =
                  this.obtenerTexto(
                    datosSala['nombre']
                  ) || 'Sala';

                estado.estadoSala =
                  estado.salaActiva
                    ? 'Mensajes en tiempo real'
                    : 'Sala inactiva';

                emitirEstado();
              },

              error => {
                this.zone.run(() => {
                  alOcurrirError(error);
                });
              }
            );

            const referenciaMensajes = collection(
              this.firestore,
              'aulas',
              aulaId,
              'salas',
              salaId,
              'mensajes'
            );

            const consultaMensajes = query(
              referenciaMensajes,
              orderBy('creadoEn', 'asc'),
              limitToLast(100)
            );

            detenerMensajes = onSnapshot(
              consultaMensajes,

              resultado => {

                mensajesCargados = true;

                estado.mensajes =
                  resultado.docs.map(documento => {

                    /*
                     * "estimate" permite mostrar una hora
                     * provisional mientras serverTimestamp()
                     * termina de sincronizarse.
                     */
                    const datos = documento.data({
                      serverTimestamps: 'estimate'
                    });

                    const autorId =
                      this.obtenerTexto(
                        datos['autorId']
                      );

                    return {
                      id: documento.id,

                      autorId,

                      autor:
                        this.obtenerTexto(
                          datos['autorNombre']
                        ) || 'Estudiante',

                      contenido:
                        this.obtenerTexto(
                          datos['contenido']
                        ),

                      hora:
                        this.formatearHora(
                          datos['creadoEn']
                        ),

                      esMio:
                        autorId === usuario.uid,

                      colorBorde:
                        autorId === usuario.uid
                          ? undefined
                          : this.obtenerColorAutor(
                              autorId
                            )
                    };
                  });

                emitirEstado();
              },

              error => {
                this.zone.run(() => {
                  alOcurrirError(error);
                });
              }
            );

            emitirEstado();
          },

          error => {
            this.zone.run(() => {
              alOcurrirError(error);
            });
          }
        );
      },

      error => {
        this.zone.run(() => {
          alOcurrirError(error);
        });
      }
    );

    return () => {
      detenerMensajes?.();
      detenerSala?.();
      detenerPerfil?.();
      detenerAutenticacion();
    };
  }

  async enviarMensaje(
    aulaId: string,
    salaId: string,
    autorNombre: string,
    contenido: string
  ): Promise<void> {

    const usuario = this.auth.currentUser;

    if (!usuario) {
      throw new Error(
        'Debes iniciar sesión para enviar mensajes.'
      );
    }

    const texto = contenido.trim();

    if (!texto) {
      throw new Error(
        'El mensaje no puede estar vacío.'
      );
    }

    if (texto.length > 2000) {
      throw new Error(
        'El mensaje no puede superar los 2000 caracteres.'
      );
    }

    const referenciaSala = doc(
      this.firestore,
      'aulas',
      aulaId,
      'salas',
      salaId
    );

    const referenciaMensajes = collection(
      referenciaSala,
      'mensajes'
    );

    /*
     * Genera un ID automático antes de ejecutar
     * la escritura por lote.
     */
    const referenciaMensaje = doc(
      referenciaMensajes
    );

    const lote = writeBatch(
      this.firestore
    );

    lote.set(
      referenciaMensaje,
      {
        autorId: usuario.uid,
        autorNombre: autorNombre.trim(),
        contenido: texto,
        tipo: 'texto',

        creadoEn: serverTimestamp(),

        editado: false,
        editadoEn: null,
        eliminado: false
      }
    );

    lote.update(
      referenciaSala,
      {
        ultimoMensaje: texto,
        ultimoMensajeAutor:
          autorNombre.trim(),

        ultimoMensajeAutorId:
          usuario.uid,

        ultimoMensajeEn:
          serverTimestamp(),

        actualizadoEn:
          serverTimestamp(),

        mensajesTotales:
          increment(1)
      }
    );

    await lote.commit();
  }

  private obtenerTexto(
    valor: unknown
  ): string {

    return typeof valor === 'string'
      ? valor.trim()
      : '';
  }

  private convertirFecha(
    valor: unknown
  ): Date | null {

    if (
      !valor ||
      typeof valor !== 'object'
    ) {
      return null;
    }

    const timestamp = valor as {
      toDate?: () => Date;
    };

    return typeof timestamp.toDate === 'function'
      ? timestamp.toDate()
      : null;
  }

  private formatearHora(
    valor: unknown
  ): string {

    const fecha =
      this.convertirFecha(valor);

    if (!fecha) {
      return '';
    }

    return new Intl.DateTimeFormat(
      'es-MX',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    ).format(fecha);
  }

  private obtenerColorAutor(
    autorId: string
  ): string {

    const colores = [
      '#00865a',
      '#075bcc',
      '#b5480a',
      '#8a3ffc',
      '#007d79',
      '#a2191f'
    ];

    let valor = 0;

    for (
      let indice = 0;
      indice < autorId.length;
      indice++
    ) {
      valor =
        autorId.charCodeAt(indice) +
        (
          (valor << 5) - valor
        );
    }

    return colores[
      Math.abs(valor) % colores.length
    ];
  }
}