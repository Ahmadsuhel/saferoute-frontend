import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { CommonModule }      from '@angular/common'
import { RouterLink }        from '@angular/router'
import { HttpClient }        from '@angular/common/http'
import { environment }       from '../../../../environments/environment'

@Component({
  selector:    'app-dashboard',
  standalone:  true,
  imports:     [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl:    './dashboard.scss'
})
export class DashboardComponent implements OnInit {

  stats:           any   = null
  incidentsByType: any[] = []
  recentIncidents: any[] = []
  loading = true

  constructor(
    private http: HttpClient,
    private cdr:  ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.http.get(`${environment.apiUrl}/admin/dashboard`).subscribe({
      next: (res: any) => {
        this.stats           = res.data.stats
        this.incidentsByType = res.data.incidentsByType
        this.recentIncidents = res.data.recentIncidents
        this.loading         = false
        this.cdr.detectChanges()  // ← YEH ADD KARO
      },
      error: () => {
        this.loading = false
        this.cdr.detectChanges()
      }
    })
  }
}