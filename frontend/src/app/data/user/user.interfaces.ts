import { ErrorMessage } from '@data/message/message.interfaces';

export interface UserSettings {
  locale?: string | undefined;
  aliasing?: boolean | undefined;
  activeBaselineId?: number | undefined;
}

export interface User {
  username: string;
  settings?: UserSettings | undefined | never;
}

export interface State {
  user?: User;
  isLoggedIn: boolean;
  loading: boolean;
  loadingBaseline: boolean;
  redirectUrl: string;
  baseline?: Baseline;
  availableBaselines?: Baseline[];
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
