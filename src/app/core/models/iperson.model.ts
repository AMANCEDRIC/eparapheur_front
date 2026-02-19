/**
 * Interface pour les informations de la personne
 * Basé sur PersonDTO, exclut les données sensibles
 */
export interface IPerson {
  id: number;
  firstName: string;      // prenUser
  lastName: string;       // nomUser
  email: string;          // emailUser
  phone?: string;         // telUser (optionnel)
  gender?: string;        // genreUser (optionnel)
  code?: string;          // codeUser (optionnel)
}

