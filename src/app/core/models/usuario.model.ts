import {
  FieldValue,
  Timestamp
} from '@angular/fire/firestore';

export interface Usuario {
  uid: string;
  correo: string;
  nombre: string;
  fotoUrl: string | null;
  aulaActualId: string | null;
  activo: boolean;
  creadoEn: Timestamp | FieldValue;
}