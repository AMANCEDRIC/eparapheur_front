export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  profileId?: number;
}

