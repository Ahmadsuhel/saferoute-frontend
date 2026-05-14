import { Component, OnInit } from '@angular/core'
import { CommonModule }      from '@angular/common'
import { AuthService }       from '../../core/services/auth.service'
import { NotificationService } from '../../core/services/notification.service'

@Component({
  selector:    'app-profile',
  standalone:  true,
  imports:     [CommonModule],
  templateUrl: './profile.html',
  styleUrl:    './profile.scss'
})
export class ProfileComponent implements OnInit {

  constructor(
    public auth:    AuthService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {}

  logout(): void {
    this.auth.logout()
  }
}