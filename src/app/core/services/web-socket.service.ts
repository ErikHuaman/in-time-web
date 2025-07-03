import { Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket!: Socket;
  private readonly SERVER_URL = environment.urlBase; // Cambia según tu entorno

  constructor() {
    this.socket = io(this.SERVER_URL, {
      transports: ['websocket'], // evita polling
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      console.log('Conectado al WebSocket Server');
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del WebSocket Server');
    });
  }

  // Escuchar alertas por usuario
  public listenToUserAlerts(userId: string): Observable<any> {
    return new Observable((observer) => {
      const event = `alerta_retraso/${userId}`;
      this.socket.on(event, (data) => {
        observer.next(data);
      });

      // Limpieza al destruir el Observable
      return () => {
        this.socket.off(event);
      };
    });
  }

  // Si necesitas emitir eventos
  public sendMessage(event: string, payload: any): void {
    this.socket.emit(event, payload);
  }
}
