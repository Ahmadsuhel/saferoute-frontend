import { Component, OnInit, OnDestroy } from '@angular/core'
import { CommonModule }  from '@angular/common'
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'
import { AuthService }   from '../../core/services/auth.service'
import { SocketService } from '../../core/services/socket.service'
import { NotificationService } from '../../core/services/notification.service'
import { Subscription } from 'rxjs'

@Component({
  selector:    'app-main-layout',
  standalone:  true,
  imports:     [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayoutComponent implements OnInit, OnDestroy {

  menuOpen = false
  private subs = new Subscription()

  constructor(
    public  auth:   AuthService,
    private socket: SocketService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    // Socket connect karo
    this.socket.connect()

    // User ki location se area join karo
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        this.socket.joinArea(pos.coords.latitude, pos.coords.longitude)
      })
    }

    // Danger alerts sunno
    this.subs.add(
      this.socket.dangerAlert$.subscribe(alert => {
        this.notify.warning(
          `${alert.type} reported nearby — ${alert.city}`,
          `🚨 Danger Alert`
        )
      })
    )

    // SOS alerts sunno
    this.subs.add(
      this.socket.sosReceived$.subscribe(sos => {
        this.notify.error(
          sos.message,
          '🆘 SOS Emergency'
        )
      })
    )
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe()
    this.socket.disconnect()
  }

  logout(): void {
    this.socket.disconnect()
    this.auth.logout()
  }
}