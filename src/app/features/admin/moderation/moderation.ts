import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient }   from '@angular/common/http'
import { environment }  from '../../../../environments/environment'
import { NotificationService } from '../../../core/services/notification.service'

@Component({
  selector:    'app-moderation',
  standalone:  true,
  imports:     [CommonModule],
  templateUrl: './moderation.html',
  styleUrl:    './moderation.scss'
})
export class ModerationComponent implements OnInit {

  incidents: any[] = []
  loading  = true
  page     = 1
  total    = 0

  constructor(
    private http:   HttpClient,
    private notify: NotificationService,
    private cdr:    ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.load() }

  load(): void {
    this.loading = true
    this.http.get(`${environment.apiUrl}/admin/incidents/pending?page=${this.page}&limit=10`)
      .subscribe({
        next: (res: any) => {
          this.incidents = res.data || []
          this.total     = res.pagination?.total || 0
          this.loading   = false
          this.cdr.detectChanges()
        },
        error: () => { this.loading = false; this.cdr.detectChanges() }
      })
  }

  moderate(id: string, action: 'APPROVE' | 'REJECT'): void {
    this.http.patch(`${environment.apiUrl}/admin/incidents/${id}`, { action }).subscribe({
      next: () => {
        this.notify.success(`Incident ${action.toLowerCase()}d!`)
        this.incidents = this.incidents.filter(i => i.id !== id)
        this.cdr.detectChanges()
      },
      error: () => this.notify.error('Action failed')
    })
  }

  getRiskColor(type: string): string {
    const high = ['VIOLENCE', 'ROBBERY', 'STREET_FIGHT']
    const med  = ['HARASSMENT', 'PROTEST', 'ACCIDENT']
    if (high.includes(type)) return '#D85A30'
    if (med.includes(type))  return '#E5A020'
    return '#534AB7'
  }

  timeAgo(d: string): string {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (diff < 60)    return `${diff}s ago`
    if (diff < 3600)  return `${Math.floor(diff/60)}m ago`
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
    return `${Math.floor(diff/86400)}d ago`
  }
}