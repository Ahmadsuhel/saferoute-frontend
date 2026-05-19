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

  form!:         FormGroup
  loading      = false
  geocoding    = false
  navigating   = false
  result:      any = null
  selectedRoute: any = null

  private map:        L.Map | null        = null
  private routeLayer: L.LayerGroup | null = null
  private userMarker: L.Marker | null     = null
  private watchId:    number | null       = null

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
    this.map = L.map('route-map', { center: [28.6139, 77.2090], zoom: 12 })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map)
    this.routeLayer = L.layerGroup().addTo(this.map)
  }

  // ── Draw route on map ─────────────────────────
  drawRouteOnMap(data: any): void {
    if (!this.map || !this.routeLayer) return
    this.routeLayer.clearLayers()

    // Sab routes draw karo
    data.routes.forEach((route: any, index: number) => {
      if (!route.path?.coordinates) return

      const latlngs: [number, number][] = route.path.coordinates.map(
        (c: number[]) => [c[1], c[0]] as [number, number]
      )

      const color   = route.safetyScore >= 70 ? '#1D9E75'
                    : route.safetyScore >= 40 ? '#E5A020' : '#D85A30'
      const weight  = route.isSafest ? 6 : 3
      const opacity = route.isSafest ? 0.9 : 0.4
      const dash    = route.isSafest ? '' : '8,8'

      const polyline = L.polyline(latlngs, { color, weight, opacity, dashArray: dash })

      polyline.on('click', () => {
        this.selectedRoute = route
        this.cdr.detectChanges()
      })

      polyline.bindTooltip(
        `${route.isSafest ? '✅ Safest' : route.isFastest ? '⚡ Fastest' : 'Route ' + (index+1)} | Score: ${route.safetyScore} | ${route.distance}km | ${route.duration}min`,
        { sticky: true }
      )

      polyline.addTo(this.routeLayer!)
    })

    // Start / End markers
    const safest = data.routes.find((r: any) => r.isSafest)
    if (safest?.path?.coordinates) {
      const latlngs: [number, number][] = safest.path.coordinates.map(
        (c: number[]) => [c[1], c[0]] as [number, number]
      )

      L.marker(latlngs[0], {
        icon: L.divIcon({
          className: '',
          html: `<div style="width:32px;height:32px;border-radius:50%;background:#1D9E75;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.4)">📍</div>`,
          iconSize: [32, 32], iconAnchor: [16, 16]
        })
      }).bindPopup('<b>Start</b>').addTo(this.routeLayer!)

      L.marker(latlngs[latlngs.length - 1], {
        icon: L.divIcon({
          className: '',
          html: `<div style="width:32px;height:32px;border-radius:50%;background:#D85A30;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.4)">🏁</div>`,
          iconSize: [32, 32], iconAnchor: [16, 16]
        })
      }).bindPopup('<b>Destination</b>').addTo(this.routeLayer!)

      this.map.fitBounds(L.latLngBounds(latlngs), { padding: [60, 60] })
    }
  }

  // ── Navigation ────────────────────────────────
  startNavigation(): void {
    if (!this.selectedRoute?.path?.coordinates && !this.result?.routes?.[0]?.path?.coordinates) {
      this.notify.error('No route selected')
      return
    }
    this.navigating = true
    this.notify.info('Navigation started! Follow the route.')
    this.cdr.detectChanges()

    this.watchId = navigator.geolocation.watchPosition(
      pos => {
        const latlng: [number, number] = [pos.coords.latitude, pos.coords.longitude]

        if (this.userMarker) {
          this.userMarker.setLatLng(latlng)
        } else {
          this.userMarker = L.marker(latlng, {
            icon: L.divIcon({
              className: '',
              html: `<div style="width:28px;height:28px;border-radius:50%;background:#534AB7;border:3px solid #fff;box-shadow:0 0 0 6px rgba(83,74,183,0.25),0 2px 8px rgba(0,0,0,0.4)"></div>`,
              iconSize: [28, 28], iconAnchor: [14, 14]
            })
          }).addTo(this.map!)
        }

        this.map?.panTo(latlng)
      },
      () => this.notify.error('Could not track location'),
      { enableHighAccuracy: true, maximumAge: 2000 }
    )
  }

  stopNavigation(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
    if (this.userMarker) {
      this.map?.removeLayer(this.userMarker)
      this.userMarker = null
    }
    this.navigating = false
    this.notify.info('Navigation stopped')
    this.cdr.detectChanges()
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
    return 2 * Math.PI * 54 - (score / 100) * 2 * Math.PI * 54
  }

  // ── Geocoding ─────────────────────────────────
  async geocodeAddress(address: string): Promise<{lat: number, lng: number} | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
      const res: any = await fetch(url, { headers: { 'Accept-Language': 'en' } }).then(r => r.json())
      if (res?.length > 0) return { lat: parseFloat(res[0].lat), lng: parseFloat(res[0].lon) }
      return null
    } catch { return null }
  }

  // ── Submit ────────────────────────────────────
  async onSubmit(): Promise<void> {
    const sourceAddr = this.form.get('sourceAddr')?.value
    const destAddr   = this.form.get('destAddr')?.value

    if (!sourceAddr) { this.notify.error('Please enter starting point'); return }
    if (!destAddr)   { this.notify.error('Please enter destination'); return }

    this.geocoding = true
    this.result    = null
    this.cdr.detectChanges()

    let src = this.form.get('sourceLat')?.value
      ? { lat: this.form.get('sourceLat')?.value, lng: this.form.get('sourceLng')?.value }
      : await this.geocodeAddress(sourceAddr)

    const dst = await this.geocodeAddress(destAddr)

    if (!src) { this.notify.error(`Location not found: "${sourceAddr}"`); this.geocoding = false; return }
    if (!dst) { this.notify.error(`Location not found: "${destAddr}"`);   this.geocoding = false; return }

    this.form.patchValue({ sourceLat: src.lat, sourceLng: src.lng, destLat: dst.lat, destLng: dst.lng })

    this.geocoding = false
    this.loading   = true
    this.cdr.detectChanges()

    this.http.post(`${environment.apiUrl}/routes/calculate`, this.form.value).subscribe({
      next: (res: any) => {
        this.result        = res.data
        this.selectedRoute = res.data.routes.find((r: any) => r.isSafest)
        this.loading       = false
        this.cdr.detectChanges()
        this.notify.success('Route calculated!')
        this.drawRouteOnMap(res.data)
      },
      error: () => { this.loading = false; this.cdr.detectChanges() }
    })
  }

  // ── Current Location ──────────────────────────
  useMyLocation(): void {
    if (!navigator.geolocation) { this.notify.error('Geolocation not supported'); return }
    navigator.geolocation.getCurrentPosition(
      pos => {
        this.form.patchValue({
          sourceLat: pos.coords.latitude,
          sourceLng: pos.coords.longitude,
          sourceAddr: 'My Location'
        })
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