import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { CommonModule }      from '@angular/common'
import { RouterLink }        from '@angular/router'
import { HttpClient }        from '@angular/common/http'
import { environment }       from '../../../../environments/environment'
import { NotificationService } from '../../../core/services/notification.service'

@Component({
  selector:    'app-nearby',
  standalone:  true,
  imports:     [CommonModule, RouterLink],
  templateUrl: './nearby.html',
  styleUrl:    './nearby.scss'
})
export class NearbyComponent implements OnInit {

  incidents: any[] = []
  loading   = true
  lat       = 28.6139
  lng       = 77.2090
  radius    = 10  // 5 se 10 kar diya — zyada coverage

  constructor(
    private http:   HttpClient,
    private notify: NotificationService,
    private cdr:    ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getLocation()
  }

  getLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          this.lat = pos.coords.latitude
          this.lng = pos.coords.longitude
          this.loadIncidents()
        },
        () => {
          // Location nahi mili — default Delhi use karo
          this.loadIncidents()
        }
      )
    } else {
      this.loadIncidents()
    }
  }

  loadIncidents(): void {
    this.loading = true
    this.cdr.detectChanges()

    const url = `${environment.apiUrl}/incidents/nearby?lat=${this.lat}&lng=${this.lng}&radius=${this.radius}`
    this.http.get(url).subscribe({
      next: (res: any) => {
        this.incidents = res.data || []
        this.loading   = false
        this.cdr.detectChanges()  // ← FIX
      },
      error: () => {
        this.loading = false
        this.cdr.detectChanges()
      }
    })
  }

  getRiskColor(type: string): string {
    const high   = ['VIOLENCE', 'ROBBERY', 'STREET_FIGHT']
    const medium = ['HARASSMENT', 'PROTEST', 'ACCIDENT']
    if (high.includes(type))   return '#D85A30'
    if (medium.includes(type)) return '#E5A020'
    return '#534AB7'
  }

  getRiskBg(type: string): string {
    return this.getRiskColor(type) + '15'
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      ROBBERY: '💰', HARASSMENT: '⚠️', VIOLENCE: '🚨',
      STREET_FIGHT: '🥊', PROTEST: '📢', ACCIDENT: '🚗',
      SUSPICIOUS: '👀', ROAD_BLOCKED: '🚧',
      UNSAFE_LIGHTING: '💡', OTHER: '📌'
    }
    return icons[type] || '📌'
  }

  formatDist(km: number): string {
    if (km === undefined || km === null) return ''
    if (km < 1) return `${Math.round(km * 1000)}m`
    return `${km.toFixed(1)}km`
  }

  timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60)    return `${diff}s ago`
    if (diff < 3600)  return `${Math.floor(diff/60)}m ago`
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
    return `${Math.floor(diff/86400)}d ago`
  }
}