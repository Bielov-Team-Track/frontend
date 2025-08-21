export interface BaseUser {
  email: string;
}

export interface User extends BaseUser {
  id: string;
}

export interface GoogleUserCreate {
  name: string;
  email: string;
  image: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  surname: string;
  imageUrl: string;
}

export interface Suspension {
  active: boolean;
  reason: string;
}
