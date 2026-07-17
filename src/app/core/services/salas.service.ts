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
  onSnapshot,
  getDoc,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';

export type FiltroChat =
  | 'Todas'
  | 'Académicas'
  | 'Social'
  | 'Urgente';

  export type CategoriaSala =
  Exclude<FiltroChat, 'Todas'>;

  export interface DatosNuevaSala {
    nombre: string;
    descripcion: string;
    categoria: CategoriaSala;
  }

  export interface ResultadoSalaCreada {
    aulaId: string;
    salaId: string;
  }

export interface ChatSala {
  id: string;
  nombre: string;
  mensaje: string;
  hora: string;
  categoria: Exclude<FiltroChat, 'Todas'>;
  icono: string;
  color: string;
  fondoIcono: string;
  mensajesNoLeidos: number;
}

export interface EstadoSalasUsuario {
  autenticado: boolean;
  correo: string;
  aulaId: string | null;
  salas: ChatSala[];
}

interface PerfilUsuario {
  correo?: string;
  aulaActualId?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class SalasService {

  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly zone = inject(NgZone);

  escucharSalasDelUsuario(
    alActualizar: (
      estado: EstadoSalasUsuario
    ) => void,
    alOcurrirError: (
      error: unknown
    ) => void
  ): () => void {

    let detenerPerfil: (() => void) | null = null;
    let detenerSalas: (() => void) | null = null;

    const detenerAutenticacion =
      onAuthStateChanged(
        this.auth,

        usuario => {

          detenerPerfil?.();
          detenerSalas?.();

          detenerPerfil = null;
          detenerSalas = null;

          if (!usuario) {

            this.zone.run(() => {
              alActualizar({
                autenticado: false,
                correo: '',
                aulaId: null,
                salas: []
              });
            });

            return;
          }

          const referenciaPerfil = doc(
            this.firestore,
            'usuarios',
            usuario.uid
          );

          detenerPerfil = onSnapshot(
            referenciaPerfil,

            documentoPerfil => {

              detenerSalas?.();
              detenerSalas = null;

              const perfil = documentoPerfil.exists()
                ? documentoPerfil.data() as PerfilUsuario
                : null;

              const correo =
                perfil?.correo?.trim() ||
                usuario.email ||
                '';

              const aulaId =
                typeof perfil?.aulaActualId === 'string' &&
                perfil.aulaActualId.trim()
                  ? perfil.aulaActualId.trim()
                  : null;

              if (!aulaId) {

                this.zone.run(() => {
                  alActualizar({
                    autenticado: true,
                    correo,
                    aulaId: null,
                    salas: []
                  });
                });

                return;
              }

              const referenciaSalas = collection(
                this.firestore,
                'aulas',
                aulaId,
                'salas'
              );

              detenerSalas = onSnapshot(
                referenciaSalas,

                resultado => {

                  const salasOrdenadas = resultado.docs
                    .map(documento => {
                      const datos = documento.data();

                      return {
                        chat: this.mapearSala(
                          documento.id,
                          datos
                        ),

                        orden:
                          this.obtenerMilisegundos(
                            datos['actualizadoEn']
                          ) ||
                          this.obtenerMilisegundos(
                            datos['creadoEn']
                          )
                      };
                    })
                    .sort(
                      (a, b) => b.orden - a.orden
                    )
                    .map(resultado => resultado.chat);

                  this.zone.run(() => {
                    alActualizar({
                      autenticado: true,
                      correo,
                      aulaId,
                      salas: salasOrdenadas
                    });
                  });
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
        },

        error => {
          this.zone.run(() => {
            alOcurrirError(error);
          });
        }
      );

    return () => {
      detenerSalas?.();
      detenerPerfil?.();
      detenerAutenticacion();
    };
  }

  private mapearSala(
    id: string,
    datos: DocumentData
  ): ChatSala {

    const categoria =
      this.obtenerCategoria(datos['categoria']);

    const apariencia =
      this.obtenerApariencia(categoria);

    const ultimoMensaje =
      this.obtenerTexto(datos['ultimoMensaje']);

    return {
      id,

      nombre:
        this.obtenerTexto(datos['nombre']) ||
        'Sala sin nombre',

      mensaje:
        ultimoMensaje ||
        'Aún no hay mensajes',

      hora:
        this.formatearFecha(
          datos['ultimoMensajeEn']
        ),

      categoria,

      icono:
        this.obtenerTexto(datos['icono']) ||
        apariencia.icono,

      color:
        this.obtenerTexto(datos['color']) ||
        apariencia.color,

      fondoIcono:
        this.obtenerTexto(datos['fondoIcono']) ||
        apariencia.fondoIcono,

      /*
       * Los mensajes no leídos se conectarán después
       * con la subcolección lecturas.
       */
      mensajesNoLeidos: 0
    };
  }

  private obtenerCategoria(
    valor: unknown
  ): Exclude<FiltroChat, 'Todas'> {

    if (
      valor === 'Académicas' ||
      valor === 'Social' ||
      valor === 'Urgente'
    ) {
      return valor;
    }

    return 'Académicas';
  }

  private obtenerApariencia(
    categoria: Exclude<FiltroChat, 'Todas'>
  ): {
    icono: string;
    color: string;
    fondoIcono: string;
  } {

    switch (categoria) {

      case 'Social':
        return {
          icono: 'people-outline',
          color: '#075bcc',
          fondoIcono: '#b8c7ff'
        };

      case 'Urgente':
        return {
          icono: 'megaphone-outline',
          color: '#d7192d',
          fondoIcono: '#ffd1d7'
        };

      case 'Académicas':
      default:
        return {
          icono: 'book-outline',
          color: '#00865a',
          fondoIcono: '#74f1bc'
        };
    }
  }

  private obtenerTexto(
    valor: unknown
  ): string {

    return typeof valor === 'string'
      ? valor.trim()
      : '';
  }

  private obtenerMilisegundos(
    valor: unknown
  ): number {

    const fecha = this.convertirFecha(valor);

    return fecha?.getTime() ?? 0;
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

    const posibleTimestamp = valor as {
      toDate?: () => Date;
    };

    if (
      typeof posibleTimestamp.toDate !== 'function'
    ) {
      return null;
    }

    return posibleTimestamp.toDate();
  }

  private formatearFecha(
    valor: unknown
  ): string {

    const fecha = this.convertirFecha(valor);

    if (!fecha) {
      return '';
    }

    const ahora = new Date();

    const inicioHoy = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate()
    );

    const inicioFecha = new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate()
    );

    const diferenciaDias = Math.round(
      (
        inicioHoy.getTime() -
        inicioFecha.getTime()
      ) / 86_400_000
    );

    if (diferenciaDias === 0) {
      return new Intl.DateTimeFormat(
        'es-MX',
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      ).format(fecha);
    }

    if (diferenciaDias === 1) {
      return 'Ayer';
    }

    if (
      diferenciaDias > 1 &&
      diferenciaDias < 7
    ) {
      return new Intl.DateTimeFormat(
        'es-MX',
        {
          weekday: 'long'
        }
      ).format(fecha);
    }

    return new Intl.DateTimeFormat(
      'es-MX',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    ).format(fecha);
  }

  async crearSala(
    datos: DatosNuevaSala
  ): Promise<ResultadoSalaCreada> {

    const usuario =
      this.auth.currentUser;

    if (!usuario) {
      throw new Error(
        'Debes iniciar sesión para crear una sala.'
      );
    }

    const referenciaPerfil = doc(
      this.firestore,
      'usuarios',
      usuario.uid
    );

    const documentoPerfil =
      await getDoc(referenciaPerfil);

    if (!documentoPerfil.exists()) {
      throw new Error(
        'No se encontró tu perfil de usuario.'
      );
    }

    const perfil =
      documentoPerfil.data();

    const aulaActualId =
      perfil['aulaActualId'];

    if (
      typeof aulaActualId !== 'string' ||
      aulaActualId.trim().length === 0
    ) {
      throw new Error(
        'Tu cuenta todavía no está asociada a un aula.'
      );
    }

    const aulaId =
      aulaActualId.trim();

    const nombre =
      datos.nombre.trim();

    const descripcion =
      datos.descripcion.trim();

    if (
      nombre.length < 3 ||
      nombre.length > 100
    ) {
      throw new Error(
        'El nombre debe tener entre 3 y 100 caracteres.'
      );
    }

    if (
      descripcion.length < 10 ||
      descripcion.length > 1000
    ) {
      throw new Error(
        'La descripción debe tener entre 10 y 1000 caracteres.'
      );
    }

    const categoriasPermitidas:
      CategoriaSala[] = [
        'Académicas',
        'Social',
        'Urgente'
      ];

    if (
      !categoriasPermitidas.includes(
        datos.categoria
      )
    ) {
      throw new Error(
        'Selecciona una categoría válida.'
      );
    }

    const nombreCompleto =
      (
        typeof perfil['nombreCompleto'] === 'string'
          ? perfil['nombreCompleto'].trim()
          : ''
      ) ||
      [
        typeof perfil['nombre'] === 'string'
          ? perfil['nombre'].trim()
          : '',

        typeof perfil['apellidos'] === 'string'
          ? perfil['apellidos'].trim()
          : ''
      ]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      usuario.displayName?.trim() ||
      usuario.email ||
      'Estudiante';

    const referenciaSalas = collection(
      this.firestore,
      'aulas',
      aulaId,
      'salas'
    );

    const nuevaSala = await addDoc(
      referenciaSalas,
      {
        nombre,
        descripcion,
        categoria: datos.categoria,

        creadorId: usuario.uid,
        creadorNombre: nombreCompleto,

        activa: true,

        creadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp(),

        ultimoMensaje: '',
        ultimoMensajeAutor: '',
        ultimoMensajeAutorId: '',
        ultimoMensajeEn: null,

        mensajesTotales: 0
      }
    );

    return {
      aulaId,
      salaId: nuevaSala.id
    };
  }
}