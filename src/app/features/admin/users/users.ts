import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient }   from '@angular/common/http'
import { environment }  from '../../../../environments/environment'
import { NotificationService } from '../../../core/services/notification.service'

@Component({
  selector:    'app-users',
  standalone:  true,
  imports:     [CommonModule],
  templateUrl: './users.html',
  styleUrl:    './users.scss'
})
export class UsersComponent implements OnInit {

  users:   any[] = []
  loading = true
  total   = 0
  page    = 1

  constructor(
    private http:   HttpClient,
    private notify: NotificationService,
    private cdr:    ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.load() }

  load(): void {
    this.loading = true
    this.http.get(`${environment.apiUrl}/admin/users?page=${this.page}&limit=20`)
      .subscribe({
        next: (res: any) => {
          this.users   = res.data || []
          this.total   = res.pagination?.total || 0
          this.loading = false
          this.cdr.detectChanges()
        },
        error: () => { this.loading = false; this.cdr.detectChanges() }
      })
  }

  banUser(id: string, action: 'BAN' | 'UNBAN'): void {
    this.http.patch(`${environment.apiUrl}/admin/users/${id}/ban`, { action })
      .subscribe({
        next: () => {
          this.notify.success(`User ${action.toLowerCase()}ned!`)
          const user = this.users.find(u => u.id === id)
          if (user) {
            user.isActive = action === 'UNBAN'
            this.cdr.detectChanges()
          }
        },
        error: () => this.notify.error('Action failed')
      })
  }

  getInitial(name: string): string {
    return name?.charAt(0)?.toUpperCase() || 'U'
  }
}