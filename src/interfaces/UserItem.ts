import { AppRole } from 'contexts/AuthContext';

export default interface UserItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  roles: AppRole[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
