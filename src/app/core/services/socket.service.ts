import { Injectable, OnDestroy } from '@angular/core'
import { io, Socket }            from 'socket.io-client'
import { Subject }               from 'rxjs'
import { environment }           from '../../../environments/environment'
import { StorageService }        from './storage.service'

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {

  private socket: Socket | null = null

  // Events
  dangerAlert$    = new Subject<any>()
  areaJoined$     = new Subject<any>()
  sosReceived$    = new Subject<any>()
  locationUpdate$ = new Subject<any>()

  constructor(private storage: StorageService) {}

  connect(): void {
    if (this.socket?.connected) return

    const token = this.storage.get<string>('accessToken')
    if (!token) return

    this.socket = io(environment.socketUrl, {
      auth:            { token },
      transports:      ['websocket', 'polling'],
      reconnection:    true,
      reconnectionDelay: 1000,
    })

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id)
    })

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected')
    })

    this.socket.on('danger-alert', (data: any) => {
      this.dangerAlert$.next(data)
    })

    this.socket.on('area-joined', (data: any) => {
      this.areaJoined$.next(data)
    })

    this.socket.on('sos-received', (data: any) => {
      this.sosReceived$.next(data)
    })

    this.socket.on('location-received', (data: any) => {
      this.locationUpdate$.next(data)
    })
  }

  disconnect(): void {
    this.socket?.disconnect()
    this.socket = null
  }

  joinArea(latitude: number, longitude: number): void {
    this.socket?.emit('join-area', { latitude, longitude })
  }

  leaveArea(): void {
    this.socket?.emit('leave-area')
  }

  triggerSOS(latitude: number, longitude: number, trustedContacts: string[]): void {
    this.socket?.emit('sos-trigger', { latitude, longitude, trustedContacts })
  }

  startLocationShare(trustedContacts: string[]): void {
    this.socket?.emit('start-sharing', { trustedContacts })
  }

  updateLocation(latitude: number, longitude: number): void {
    this.socket?.emit('location-update', { latitude, longitude })
  }

  stopLocationShare(): void {
    this.socket?.emit('stop-sharing')
  }

  get isConnected(): boolean {
    return this.socket?.connected || false
  }

  ngOnDestroy(): void {
    this.disconnect()
  }
}