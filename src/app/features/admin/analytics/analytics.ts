import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient }   from '@angular/common/http'
import { environment }  from '../../../../environments/environment'

@Component({
  selector:    'app-analytics',
  standalone:  true,
  imports:     [CommonModule],
  templateUrl: './analytics.html',
  styleUrl:    './analytics.scss'
})
export class AnalyticsComponent implements OnInit {

  data:    any = null
  loading = true

  constructor(
    private http: HttpClient,
    private cdr:  ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.http.get(`${environment.apiUrl}/admin/analytics?days=30`)
      .subscribe({
        next: (res: any) => {
          this.data    = res.data
          this.loading = false
          this.cdr.detectChanges()
        },
        error: () => { this.loading = false; this.cdr.detectChanges() }
      })
  }

  getMaxCount(): number {
    if (!this.data?.byType?.length) return 1
    return Math.max(...this.data.byType.map((t: any) => t.count))
  }

  getBarWidth(count: number): number {
    return (count / this.getMaxCount()) * 100
  }

  getRiskColor(type: string): string {
    const high = ['VIOLENCE', 'ROBBERY', 'STREET_FIGHT']
    const med  = ['HARASSMENT', 'PROTEST', 'ACCIDENT']
    if (high.includes(type)) return '#D85A30'
    if (med.includes(type))  return '#E5A020'
    return '#534AB7'
  }
}