import { Component, OnInit } from '@angular/core'
import { CommonModule }      from '@angular/common'
import { Router }            from '@angular/router'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'
import { HttpClient }          from '@angular/common/http'
import { environment }         from '../../../../environments/environment'
import { NotificationService } from '../../../core/services/notification.service'

@Component({
  selector:    'app-report',
  standalone:  true,
  imports:     [CommonModule, ReactiveFormsModule],
  templateUrl: './report.html',
  styleUrl:    './report.scss'
})
export class ReportComponent implements OnInit {

  form!:    FormGroup
  loading = false

  types = [
    { value: 'ROBBERY',        label: 'Robbery',         icon: '💰', color: '#D85A30' },
    { value: 'HARASSMENT',     label: 'Harassment',      icon: '⚠️', color: '#E5A020' },
    { value: 'VIOLENCE',       label: 'Violence',        icon: '🚨', color: '#D85A30' },
    { value: 'STREET_FIGHT',   label: 'Street Fight',    icon: '🥊', color: '#D85A30' },
    { value: 'PROTEST',        label: 'Protest',         icon: '📢', color: '#E5A020' },
    { value: 'ACCIDENT',       label: 'Accident',        icon: '🚗', color: '#E5A020' },
    { value: 'SUSPICIOUS',     label: 'Suspicious',      icon: '👀', color: '#534AB7' },
    { value: 'ROAD_BLOCKED',   label: 'Road Blocked',    icon: '🚧', color: '#E5A020' },
    { value: 'UNSAFE_LIGHTING',label: 'Unsafe Lighting', icon: '💡', color: '#534AB7' },
    { value: 'OTHER',          label: 'Other',           icon: '📌', color: '#666'    },
  ]

  cities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune']

  constructor(
    private fb:     FormBuilder,
    private http:   HttpClient,
    private notify: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      type:        ['ROBBERY',  Validators.required],
      description: [''],
      latitude:    [28.6139,   Validators.required],
      longitude:   [77.2090,   Validators.required],
      address:     [''],
      city:        ['Delhi',   Validators.required],
      isAnonymous: [false]
    })

    this.detectLocation()
  }

  get selectedType() {
    return this.types.find(t => t.value === this.form.get('type')?.value)
  }

  selectType(value: string): void {
    this.form.patchValue({ type: value })
  }

  detectLocation(): void {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(pos => {
      this.form.patchValue({
        latitude:  pos.coords.latitude,
        longitude: pos.coords.longitude
      })
    })
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    this.loading = true
    this.http.post(`${environment.apiUrl}/incidents/report`, this.form.value).subscribe({
      next: () => {
        this.notify.success('Incident reported successfully!')
        this.router.navigate(['/incidents/nearby'])
      },
      error: () => { this.loading = false }
    })
  }
}