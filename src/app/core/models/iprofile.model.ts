import { IPermission } from './ipermission.model';

/**
 * Interface pour le profil utilisateur
 * Basé sur ProfileDTO
 */
export interface IProfile {
  id: number;
  code: string;           // libProfil (ex: "ADMIN", "AGENT", "MANAGER")
  name: string;           // libProfil (même valeur que code)
  description: string;    // description du profil
  permissions: IPermission[];  // Tableau de permissions
}

