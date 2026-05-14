import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { CommonModule }      from '@angular/common'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'
import { HttpClient }          from '@angular/common/http'
import { environment }         from '../../../environments/environment'
import { NotificationService } from '../../core/services/notification.service'
import * as L from 'leaflet'

@Component({
  selector:    'app-route-finder',
  standalone:  true,
  imports:     [CommonModule, ReactiveFormsModule],
  templateUrl: './route-finder.html',
  styleUrl:    './route-finder.scss'
})
export class RouteFinderComponent implements OnInit {

  form!:    FormGroup
  loading   = false
  geocoding = false
  result:   any = null

  private map:        L.Map | null        = null
  private routeLayer: L.LayerGroup | null = null

  constructor(
    private fb:     FormBuilder,
    private http:   HttpClient,
    private notify: NotificationService,
    private cdr:    ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      sourceAddr: ['', Validators.required],
      sourceLat:  [null, Validators.required],
      sourceLng:  [null, Validators.required],
      destAddr:   [''],
      destLat:    [null, Validators.required],
      destLng:    [null, Validators.required],
      city:       ['Delhi']
    })
    setTimeout(() => this.initMap(), 200)
  }

  // ── Map init ──────────────────────────────────
  initMap(): void {
    if (this.map) return
    this.map = L.map('route-map', {
      center: [28.6139, 77.2090],
      zoom:   12
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map)
    this.routeLayer = L.layerGroup().addTo(this.map)
  }

  // ── Draw route on map ─────────────────────────
  drawRouteOnMap(data: any): void {
    if (!this.map || !this.routeLayer) return
    this.routeLayer.clearLayers()

    const safestRoute = data.routes.find((r: any) => r.isSafest)
    if (!safestRoute?.path?.coordinates) return

    const latlngs: [number, number][] = safestRoute.path.coordinates.map(
      (c: number[]) => [c[1], c[0]] as [number, number]
    )

    const color = safestRoute.safetyScore >= 70 ? '#1D9E75'
                : safestRoute.safetyScore >= 40 ? '#E5A020' : '#D85A30'

    // Route line
    L.polyline(latlngs, { color, weight: 5, opacity: 0.85 })
      .addTo(this.routeLayer)

    // Start marker — green
    L.circleMarker(latlngs[0], {
      radius: 9, color: '#fff', weight: 2,
      fillColor: '#1D9E75', fillOpacity: 1
    }).bindPopup('<b>📍 Start</b>').addTo(this.routeLayer)

    // End marker — red
    L.circleMarker(latlngs[latlngs.length - 1], {
      radius: 9, color: '#fff', weight: 2,
      fillColor: '#D85A30', fillOpacity: 1
    }).bindPopup('<b>🏁 End</b>').addTo(this.routeLayer)

    // Fit map
    this.map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40] })
  }

  // ── Getters ───────────────────────────────────
  get riskColor() {
    if (!this.result) return '#1D9E75'
    const score = this.result.routes[0]?.safetyScore || 0
    if (score >= 70) return '#1D9E75'
    if (score >= 40) return '#E5A020'
    return '#D85A30'
  }

  get riskLabel() {
    if (!this.result) return ''
    const score = this.result.routes[0]?.safetyScore || 0
    if (score >= 70) return 'SAFE'
    if (score >= 40) return 'CAUTION'
    return 'DANGER'
  }

  get scoreOffset() {
    const score = this.result?.routes[0]?.safetyScore || 0
    const circumference = 2 * Math.PI * 54
    return circumference - (score / 100) * circumference
  }

  // ── Geocoding ─────────────────────────────────
  async geocodeAddress(address: string): Promise<{lat: number, lng: number} | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
      const res: any = await fetch(url, {
        headers: { 'Accept-Language': 'en' }
      }).then(r => r.json())
      if (res && res.length > 0) {
        return { lat: parseFloat(res[0].lat), lng: parseFloat(res[0].lon) }
      }
      return null
    } catch { return null }
  }

  // ── Submit ────────────────────────────────────
  async onSubmit(): Promise<void> {
    const sourceAddr = this.form.get('sourceAddr')?.value
    const destAddr   = this.form.get('destAddr')?.value

    if (!sourceAddr) {
      this.notify.error('Please enter starting point')
      return
    }
    if (!destAddr) {
      this.notify.error('Please enter destination')
      return
    }

    this.geocoding = true
    this.result    = null
    this.cdr.detectChanges()

    // Source — agar lat/lng already hai (current location) toh geocode mat karo
    let src = this.form.get('sourceLat')?.value
      ? { lat: this.form.get('sourceLat')?.value, lng: this.form.get('sourceLng')?.value }
      : await this.geocodeAddress(sourceAddr)

    const dst = await this.geocodeAddress(destAddr)

    if (!src) {
      this.notify.error(`Location not found: "${sourceAddr}"`)
      this.geocoding = false
      return
    }
    if (!dst) {
      this.notify.error(`Location not found: "${destAddr}"`)
      this.geocoding = false
      return
    }

    this.form.patchValue({
      sourceLat: src.lat, sourceLng: src.lng,
      destLat:   dst.lat, destLng:   dst.lng
    })

    this.geocoding = false
    this.loading   = true
    this.cdr.detectChanges()

    this.http.post(`${environment.apiUrl}/routes/calculate`, this.form.value).subscribe({
      next: (res: any) => {
        this.result  = res.data
        this.loading = false
        this.cdr.detectChanges()
        this.notify.success('Route calculated!')
        this.drawRouteOnMap(res.data)  // ← MAP DRAW
      },
      error: () => {
        this.loading = false
        this.cdr.detectChanges()
      }
    })
  }

  // ── Current Location ──────────────────────────
  useMyLocation(): void {
    if (!navigator.geolocation) {
      this.notify.error('Geolocation not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        this.form.patchValue({
          sourceLat:  pos.coords.latitude,
          sourceLng:  pos.coords.longitude,
          sourceAddr: 'My Location'
        })
        // Map par bhi move karo
        if (this.map) {
          this.map.setView([pos.coords.latitude, pos.coords.longitude], 14)
          if (this.routeLayer) {
            L.circleMarker([pos.coords.latitude, pos.coords.longitude], {
              radius: 8, color: '#fff', weight: 2,
              fillColor: '#534AB7', fillOpacity: 1
            }).bindPopup('📍 You are here').openPopup().addTo(this.routeLayer)
          }
        }
        this.notify.success('Current location detected!')
      },
      () => this.notify.error('Could not get location. Please allow location access.')
    )
  }
}