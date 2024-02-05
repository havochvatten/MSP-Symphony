import { Subject, Observable } from 'rxjs';

export class DialogRef {
  private readonly _afterClosed = new Subject<unknown>();
  afterClosed: Observable<unknown> = this._afterClosed.asObservable();

  close = (result?: unknown) => {
    this._afterClosed.next(result);
  };
}
