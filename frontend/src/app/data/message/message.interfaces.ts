export type MessageType = 'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING';

export interface Message {
  uuid: string;
  type: MessageType;
  title?: string;
  message: string;
}

export interface ErrorMessage {
  status: number;
  message: string; //ServerError;
}

export interface ServerError {
 errorCode: string;
 errorMessage: string;
 requestId: string;
}

export interface State {
  popup: Message[];
}
