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
  DocumentReference,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  updateDoc,
  writeBatch
} from 'firebase/firestore';

export interface InformacionSala {
  id: string;
  nombre: string;

  creadorId: string;
  creadorNombre: string;
  creadorCorreo: string;
  esCreador: boolean;

  imagenUrl: string | null;
  categoria: string;
  descripcion: string;

  mensajesTotales: number;
  popularidad: number;
  popularidadTexto: string;

  fechaCreacion: string;
  cicloEscolar: string;

  activa: boolean;
}

export interface EstadoInformacionSala {
  autenticado: boolean;
  cargando: boolean;
  aulaId: string | null;
  salaExiste: boolean;
  mensajeEstado: string;
  sala: InformacionSala | null;
}

@Injectable({
  providedIn: 'root'
})
export class InfoSalaService {

  private readonly auth =
    inject(Auth);

  private readonly firestore =
    inject(Firestore);

  private readonly zone =
    inject(NgZone);

  /**
   * Escucha en tiempo real:
   *
   * usuarios/{uid}
   * aulas/{aulaId}
   * aulas/{aulaId}/salas/{salaId}
   * aulas/{aulaId}/miembros/{creadorId}
   */
  escucharInformacionSala(
    salaId: string,
    alActualizar: (
      estado: EstadoInformacionSala
    ) => void,
    alOcurrirError: (
      error: unknown
    ) => void
  ): () => void {

    let detenerPerfil:
      (() => void) | null = null;

    let detenerAula:
      (() => void) | null = null;

    let detenerSala:
      (() => void) | null = null;

    let detenerCreador:
      (() => void) | null = null;

    let autenticacionResuelta = false;
    let autenticado = false;

    let perfilCargado = false;
    let aulaCargada = false;
    let salaCargada = false;
    let creadorCargado = true;

    let usuarioActualId = '';
    let aulaId: string | null = null;

    let datosAula:
      DocumentData | null = null;

    let datosSala:
      DocumentData | null = null;

    let datosCreador:
      DocumentData | null = null;

    let creadorIdActual:
      string | null = null;

    const detenerDatosAula = (): void => {

      detenerAula?.();
      detenerSala?.();
      detenerCreador?.();

      detenerAula = null;
      detenerSala = null;
      detenerCreador = null;

      aulaCargada = false;
      salaCargada = false;
      creadorCargado = true;

      datosAula = null;
      datosSala = null;
      datosCreador = null;

      creadorIdActual = null;
    };

    const emitirEstado = (): void => {

      const cargando =
        !autenticacionResuelta ||
        (
          autenticado &&
          (
            !perfilCargado ||
            (
              aulaId !== null &&
              (
                !aulaCargada ||
                !salaCargada ||
                !creadorCargado
              )
            )
          )
        );

      const salaExiste =
        salaCargada &&
        datosSala !== null;

      let mensajeEstado = '';

      if (
        autenticado &&
        perfilCargado &&
        !aulaId
      ) {

        mensajeEstado =
          'Tu cuenta no está asociada a un aula.';

      } else if (
        autenticado &&
        aulaId &&
        salaCargada &&
        !datosSala
      ) {

        mensajeEstado =
          'La sala no existe o no pertenece a tu aula.';
      }

      const sala =
        salaExiste && datosSala
          ? this.mapearInformacionSala(
              salaId,
              datosSala,
              datosAula,
              datosCreador,
              usuarioActualId
            )
          : null;

      this.zone.run(() => {

        alActualizar({
          autenticado,
          cargando,
          aulaId,
          salaExiste,
          mensajeEstado,
          sala
        });
      });
    };

    /**
     * Carga al creador desde:
     *
     * aulas/{aulaId}/miembros/{creadorId}
     */
    const actualizarCreador = (): void => {

      if (!aulaId) {
        return;
      }

      const nuevoCreadorId =
        this.obtenerTexto(
          datosSala?.['creadorId']
        ) || null;

      if (
        nuevoCreadorId ===
        creadorIdActual
      ) {
        return;
      }

      detenerCreador?.();
      detenerCreador = null;

      creadorIdActual =
        nuevoCreadorId;

      datosCreador = null;

      if (!nuevoCreadorId) {

        creadorCargado = true;
        emitirEstado();

        return;
      }

      creadorCargado = false;
      emitirEstado();

      const referenciaCreador = doc(
        this.firestore,
        'aulas',
        aulaId,
        'miembros',
        nuevoCreadorId
      );

      detenerCreador = onSnapshot(
        referenciaCreador,

        documentoCreador => {

          datosCreador =
            documentoCreador.exists()
              ? documentoCreador.data()
              : null;

          creadorCargado = true;

          emitirEstado();
        },

        error => {

          /*
           * Aunque no se encuentre el miembro,
           * todavía puede mostrarse creadorNombre
           * almacenado dentro de la sala.
           */
          console.error(
            'No se pudo cargar al creador:',
            error
          );

          datosCreador = null;
          creadorCargado = true;

          emitirEstado();
        }
      );
    };

    const detenerAutenticacion =
      onAuthStateChanged(
        this.auth,

        usuario => {

          autenticacionResuelta = true;

          detenerPerfil?.();
          detenerPerfil = null;

          detenerDatosAula();

          perfilCargado = false;
          aulaId = null;

          if (!usuario) {

            autenticado = false;
            usuarioActualId = '';
            perfilCargado = true;

            emitirEstado();

            return;
          }

          autenticado = true;
          usuarioActualId = usuario.uid;

          emitirEstado();

          const referenciaPerfil = doc(
            this.firestore,
            'usuarios',
            usuario.uid
          );

          detenerPerfil = onSnapshot(
            referenciaPerfil,

            documentoPerfil => {

              detenerDatosAula();

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
                documentoPerfil.data();

              const aulaActualId =
                perfil['aulaActualId'];

              aulaId =
                typeof aulaActualId === 'string' &&
                aulaActualId.trim().length > 0
                  ? aulaActualId.trim()
                  : null;

              if (!aulaId) {

                emitirEstado();

                return;
              }

              emitirEstado();

              const referenciaAula = doc(
                this.firestore,
                'aulas',
                aulaId
              );

              const referenciaSala = doc(
                this.firestore,
                'aulas',
                aulaId,
                'salas',
                salaId
              );

              detenerAula = onSnapshot(
                referenciaAula,

                documentoAula => {

                  datosAula =
                    documentoAula.exists()
                      ? documentoAula.data()
                      : null;

                  aulaCargada = true;

                  emitirEstado();
                },

                error => {

                  this.zone.run(() => {
                    alOcurrirError(error);
                  });
                }
              );

              detenerSala = onSnapshot(
                referenciaSala,

                documentoSala => {

                  datosSala =
                    documentoSala.exists()
                      ? documentoSala.data()
                      : null;

                  salaCargada = true;

                  actualizarCreador();
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
        },

        error => {

          this.zone.run(() => {
            alOcurrirError(error);
          });
        }
      );

    return () => {

      detenerCreador?.();
      detenerSala?.();
      detenerAula?.();
      detenerPerfil?.();
      detenerAutenticacion();
    };
  }

  /**
   * Elimina una sala y las subcolecciones
   * conocidas pertenecientes a ella.
   */
  async eliminarSala(
    aulaId: string,
    salaId: string
  ): Promise<void> {

    const usuario =
      this.auth.currentUser;

    if (!usuario) {

      throw new Error(
        'Debes iniciar sesión nuevamente.'
      );
    }

    const referenciaSala = doc(
      this.firestore,
      'aulas',
      aulaId,
      'salas',
      salaId
    );

    const documentoSala =
      await getDoc(referenciaSala);

    if (!documentoSala.exists()) {

      throw new Error(
        'La sala ya no existe.'
      );
    }

    const datosSala =
      documentoSala.data();

    const creadorId =
      datosSala['creadorId'];

    if (
      typeof creadorId !== 'string' ||
      creadorId !== usuario.uid
    ) {

      throw new Error(
        'Únicamente el creador puede eliminar esta sala.'
      );
    }

    /*
     * Primero se bloquea la sala para impedir
     * la creación de nuevos mensajes.
     */
    await updateDoc(
      referenciaSala,
      {
        activa: false,
        eliminando: true
      }
    );

    /*
     * Firestore no elimina automáticamente
     * las subcolecciones.
     */
    await this.eliminarSubcoleccion(
      referenciaSala,
      'mensajes'
    );

    await this.eliminarSubcoleccion(
      referenciaSala,
      'lecturas'
    );

    /*
     * Si agregas una subcolección nueva:
     *
     * await this.eliminarSubcoleccion(
     *   referenciaSala,
     *   'archivos'
     * );
     */

    await deleteDoc(
      referenciaSala
    );
  }

  private async eliminarSubcoleccion(
    referenciaSala:
      DocumentReference<DocumentData>,
    nombreSubcoleccion: string
  ): Promise<void> {

    const referenciaSubcoleccion =
      collection(
        referenciaSala,
        nombreSubcoleccion
      );

    while (true) {

      const consulta = query(
        referenciaSubcoleccion,
        limit(20)
      );

      const resultado =
        await getDocs(consulta);

      if (resultado.empty) {
        break;
      }

      const lote =
        writeBatch(this.firestore);

      resultado.docs.forEach(
        documento => {

          lote.delete(
            documento.ref
          );
        }
      );

      await lote.commit();
    }
  }

  private mapearInformacionSala(
    id: string,
    sala: DocumentData,
    aula: DocumentData | null,
    creador: DocumentData | null,
    usuarioActualId: string
  ): InformacionSala {

    const mensajesTotales =
      this.obtenerNumero(
        sala['mensajesTotales']
      );

    const creadorId =
      this.obtenerTexto(
        sala['creadorId']
      );

    const creadorNombre =
      this.obtenerNombrePersona(
        creador
      ) ||
      this.obtenerTexto(
        sala['creadorNombre']
      ) ||
      'Usuario no identificado';

    const creadorCorreo =
      this.obtenerTexto(
        creador?.['correo']
      );

    const imagenUrl =
      this.obtenerTexto(
        sala['imagenUrl']
      ) ||
      this.obtenerTexto(
        sala['imagen']
      ) ||
      null;

    return {
      id,

      nombre:
        this.obtenerTexto(
          sala['nombre']
        ) || 'Sala sin nombre',

      creadorId,

      creadorNombre,

      creadorCorreo,

      esCreador:
        creadorId.length > 0 &&
        creadorId === usuarioActualId,

      imagenUrl,

      categoria:
        (
          this.obtenerTexto(
            sala['categoria']
          ) || 'Sala de estudio'
        ).toUpperCase(),

      descripcion:
        this.obtenerTexto(
          sala['descripcion']
        ) ||
        'Esta sala no tiene descripción.',

      mensajesTotales,

      popularidad:
        Math.min(
          mensajesTotales / 100,
          1
        ),

      popularidadTexto:
        this.obtenerPopularidadTexto(
          mensajesTotales
        ),

      fechaCreacion:
        this.formatearFecha(
          sala['creadoEn']
        ),

      cicloEscolar:
        this.formatearCicloEscolar(
          aula?.['cicloEscolar'] ??
          sala['cicloEscolar']
        ),

      activa:
        sala['activa'] !== false
    };
  }

  private obtenerNombrePersona(
    datos: DocumentData | null
  ): string {

    if (!datos) {
      return '';
    }

    const nombreCompleto =
      this.obtenerTexto(
        datos['nombreCompleto']
      );

    if (nombreCompleto) {
      return nombreCompleto;
    }

    return [
      this.obtenerTexto(
        datos['nombre']
      ),
      this.obtenerTexto(
        datos['apellidos']
      )
    ]
      .filter(Boolean)
      .join(' ')
      .trim();
  }

  private obtenerPopularidadTexto(
    mensajesTotales: number
  ): string {

    if (mensajesTotales >= 75) {
      return 'Alta';
    }

    if (mensajesTotales >= 25) {
      return 'Media';
    }

    if (mensajesTotales > 0) {
      return 'Baja';
    }

    return 'Sin actividad';
  }

  private formatearCicloEscolar(
    valor: unknown
  ): string {

    const ciclo =
      this.obtenerTexto(valor);

    if (!ciclo) {
      return 'Ciclo escolar no especificado';
    }

    if (
      ciclo
        .toLowerCase()
        .startsWith('ciclo')
    ) {
      return ciclo;
    }

    return `Ciclo lectivo ${ciclo}`;
  }

  private formatearFecha(
    valor: unknown
  ): string {

    const fecha =
      this.convertirFecha(valor);

    if (!fecha) {
      return 'Fecha no disponible';
    }

    const fechaFormateada =
      new Intl.DateTimeFormat(
        'es-MX',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }
      ).format(fecha);

    return (
      fechaFormateada
        .charAt(0)
        .toUpperCase() +
      fechaFormateada.slice(1)
    );
  }

  private convertirFecha(
    valor: unknown
  ): Date | null {

    if (valor instanceof Date) {
      return valor;
    }

    if (
      !valor ||
      typeof valor !== 'object'
    ) {
      return null;
    }

    const timestamp = valor as {
      toDate?: () => Date;
    };

    return typeof timestamp.toDate ===
      'function'
        ? timestamp.toDate()
        : null;
  }

  private obtenerNumero(
    valor: unknown
  ): number {

    return (
      typeof valor === 'number' &&
      Number.isFinite(valor)
    )
      ? Math.max(0, valor)
      : 0;
  }

  private obtenerTexto(
    valor: unknown
  ): string {

    return typeof valor === 'string'
      ? valor.trim()
      : '';
  }
}