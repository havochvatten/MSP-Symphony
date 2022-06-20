export interface User {
  username: string;
}

export interface State {
  user?: User;
  isLoggedIn: boolean;
  loading: boolean;
  redirectUrl: string;
  baseline?: Baseline;
  error?: any;
}

export interface Baseline {
  id: number;
  name: string;
  description: string;
  validFrom: number; // datetime
}
