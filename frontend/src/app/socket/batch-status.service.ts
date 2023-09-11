import { Injectable } from '@angular/core';
import { environment as env } from '@src/environments/environment';
import { BatchCalculationProcessEntry } from "@data/calculation/calculation.interfaces";
import { CalculationActions } from "@data/calculation";
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";

@Injectable({
  providedIn: 'root'
})
export class BatchStatusService {

  // public statusUpdates: {[id: number]: BehaviorSubject<BatchCalculationProcessEntry|undefined>} = {};
  private sockets: {[id: number]: WebSocket} = {};

  constructor(
      private store: Store<State>,
  ) { }

  public connect(id: number) {
    if (!this.sockets[id]) {
      this.sockets[id] = new WebSocket( `wss://${window.location.host}${env.socketBaseUrl}/batch-status/${id}` );

      this.sockets[id].onopen = () => {
        //this.statusUpdates[id] = new BehaviorSubject<BatchCalculationProcessEntry|undefined>(undefined);
        console.log('Connected to batch status service');
      };
      this.sockets[id].onmessage = (event) => {
        const process : BatchCalculationProcessEntry = JSON.parse(event.data);
        this.store.dispatch(CalculationActions.updateBatchProcess({ id: process.id, process }));

        if(process.currentScenario === null &&
           process.calculated.length + process.failed.length === process.scenarios.length) {
          this.disconnect(id);
        }
      };
      this.sockets[id].onclose = () => {
        this.disconnect(id);
      };
    }


    // this.socket = new WebSocket( 'wss://' + window.location.host + env.socketBaseUrl + '/batch-status/' + id, );
    //
    // this.socket.onopen = () => {
    //   console.log('Connected to batch status service');
    // };
    // this.socket.onmessage = (event) => {
    //   this.statusUpdate$.next(JSON.parse(event.data));
    // };
    // this.socket.onclose = () => {
    //   console.log('Disconnected from batch status service');
    // };
  }

  public disconnect(id:number) {
    if (this.sockets[id]) {
      this.sockets[id].close();
      delete this.sockets[id];
      // if(this.statusUpdates[id]) {
      //   this.statusUpdates[id].complete();
      //   delete this.statusUpdates[id];
      // }
    }
  }
}
