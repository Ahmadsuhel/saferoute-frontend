import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient }   from '@angular/common/http'
import { environment }  from '../../../../environments/environment'
import * as L from 'leaflet'

@Component({
  selector:    'app-heatmap',
  standalone:  true,
  imports:     [CommonModule],
  templateUrl: './heatmap.html',
  styleUrl:    './heatmap.scss'
})
export class HeatmapComponent implements OnInit {

  data:    any   = null
  loading = true
  city    = 'Delhi'
  cities  = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai']

  private map:   L.Map | null = null

  constructor(
    private http: HttpClient,
    private cdr:  ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    setTimeout(() => this.initMap(), 200)
    this.load()
  }

  initMap(): void {
    if (this.map) return
    this.map = L.map('heatmap', { center: [28.6139, 77.2090], zoom: 11 })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map)
  }

  load(): void {
    this.loading = true
    this.http.get(`${environment.apiUrl}/admin/heatmap?city=${this.city}`)
      .subscribe({
        next: (res: any) => {
          this.data    = res.data
          this.loading = false
          this.cdr.detectChanges()
          this.drawHeatmap(res.data.heatmap)
        },
        error: () => { this.loading = false; this.cdr.detectChanges() }
      })
  }

  drawHeatmap(cells: any[]): void {
    if (!this.map) return

    // Clear existing circles
    this.map.eachLayer(layer => {
      if (layer instanceof L.CircleMarker) this.map!.removeLayer(layer)
    })

    cells.forEach(cell => {
      const color = cell.safetyScore >= 70 ? '#1D9E75'
                  : cell.safetyScore >= 40 ? '#E5A020' : '#D85A30'

      L.circleMarker([cell.latitude, cell.longitude], {
        radius:      Math.max(20, cell.incidentCount * 15),
        color:       'transparent',
        fillColor:   color,
        fillOpacity: 0.35,
      })
      .bindPopup(`
        <b>${cell.riskLevel}</b><br>
        Score: ${cell.safetyScore}<br>
        Incidents: ${cell.incidentCount}
      `)
      .addTo(this.map!)
    })
  }

  changeCity(city: string): void {
    this.city = city
    this.load()
  }
}