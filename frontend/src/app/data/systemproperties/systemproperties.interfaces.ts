export interface ConfigState {
  appConfig: AppConfig;
  loaded: boolean;
  error: string | null;
}

export interface AppConfig {
  publicAccess: boolean;
  // Add other config properties here if needed
}
