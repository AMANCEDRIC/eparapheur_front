import { IPerson } from './iperson.model';
import { IProfile } from './iprofile.model';
import { IAvatar } from './iavatar.model';

/**
 * Interface principale pour un compte avec toutes les informations structurées
 * Basé sur AccountDetailDTO
 * Exclut les données sensibles : mpCmpt, sessionToken, connectionAttempt, etc.
 */
export interface IAccountDetail {
  id: number;
  login: string;              // loginCmpt (email)
  active: boolean;
  deleted: boolean;
  createdAt: string | null;   // Timestamp en format ISO string
  updatedAt: string | null;
  lastConnectedAt: string | null;
  
  // Objets imbriqués
  person: IPerson | null;
  profile: IProfile | null;
  avatar: IAvatar | null;
}

