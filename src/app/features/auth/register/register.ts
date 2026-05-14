import { Component, OnInit } from '@angular/core'
import { CommonModule }      from '@angular/common'
import { RouterLink, Router } from '@angular/router'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms'
import { AuthService }         from '../../../core/services/auth.service'
import { NotificationService } from '../../../core/services/notification.service'

@Component({
  selector:    'app-register',
  standalone:  true,
  imports:     [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl:    './register.scss'
})
export class RegisterComponent implements OnInit {

  form!:    FormGroup
  loading = false
  showPass = false
  step    = 1  // 2 step form

  cities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai',
            'Kolkata', 'Pune', 'Jaipur', 'Lucknow', 'Ahmedabad']

  constructor(
    private fb:     FormBuilder,
    private auth:   AuthService,
    private notify: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:     ['', [Validators.required, Validators.minLength(2)]],
      email:    ['', [Validators.required, Validators.email]],
      phone:    ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      city:     ['Delhi', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    })
  }

  get name()     { return this.form.get('name')! }
  get email()    { return this.form.get('email')! }
  get phone()    { return this.form.get('phone')! }
  get city()     { return this.form.get('city')! }
  get password() { return this.form.get('password')! }

  get passwordStrength(): number {
    const val = this.password.value || ''
    let score = 0
    if (val.length >= 6)           score++
    if (val.length >= 10)          score++
    if (/[A-Z]/.test(val))         score++
    if (/[0-9]/.test(val))         score++
    if (/[^A-Za-z0-9]/.test(val))  score++
    return score
  }

  get strengthLabel(): string {
    const s = this.passwordStrength
    if (s <= 1) return 'Weak'
    if (s <= 3) return 'Medium'
    return 'Strong'
  }

  get strengthColor(): string {
    const s = this.passwordStrength
    if (s <= 1) return '#D85A30'
    if (s <= 3) return '#E5A020'
    return '#1D9E75'
  }

  nextStep(): void {
    const step1Fields = ['name', 'email', 'phone', 'city']
    step1Fields.forEach(f => this.form.get(f)!.markAsTouched())
    const step1Valid = step1Fields.every(f => this.form.get(f)!.valid)
    if (step1Valid) this.step = 2
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    this.loading = true
    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.notify.success('Account created successfully!')
        this.router.navigate(['/home'])
      },
      error: () => { this.loading = false }
    })
  }
}