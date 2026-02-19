/**
 * Interface pour l'avatar de l'utilisateur
 * Basé sur AvatarDTO
 */
export interface IAvatar {
  id: number;
  url: string;            // imgCmpt de AccountEntity
  createdAt: string;      // Timestamp en format ISO string
}

