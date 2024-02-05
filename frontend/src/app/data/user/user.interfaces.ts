import { ErrorMessage } from "@data/message/message.interfaces";

export interface User {
  username: string;
}

export interface State {
  user?: User;
  isLoggedIn: boolean;
  loading: boolean;
  redirectUrl: string;
  baseline?: Baseline;
  error?: { login?: ErrorMessage };
  aliasing: boolean;
}

export interface Baseline {
  id: number;
  name: string;
  description: string;
  locale: string;
  validFrom: number; // datetime
}
