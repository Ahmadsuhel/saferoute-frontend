import { Component, OnInit } from '@angular/core'
import { CommonModule }      from '@angular/common'
import { RouterLink, Router, ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'
import { AuthService }         from '../../../core/services/auth.service'
import { NotificationService } from '../../../core/services/notification.service'

@Component({
  selector:    'app-reset-password',
  standalone:  true,
  imports:     [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl:    './reset-password.scss'
})
export class ResetPasswordComponent implements OnInit {

  form!:    FormGroup
  loading = false
  showPass = false
  done    = false

  constructor(
    private fb:     FormBuilder,
    private auth:   AuthService,
    private notify: NotificationService,
    private router: Router,
    private route:  ActivatedRoute
  ) {}

  ngOnInit(): void {
    const email = this.route.snapshot.queryParams['email'] || ''

    this.form = this.fb.group({
      email:       [email, [Validators.required, Validators.email]],
      otp:         ['',    [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword: ['',    [Validators.required, Validators.minLength(6)]]
    })
  }

  get email()       { return this.form.get('email')! }
  get otp()         { return this.form.get('otp')! }
  get newPassword() { return this.form.get('newPassword')! }

  // OTP input — only numbers
  onOtpInput(event: Event): void {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/\D/g, '').slice(0, 6)
    this.form.get('otp')!.setValue(input.value)
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    this.loading = true
    this.auth.resetPassword(this.form.value).subscribe({
      next: () => {
        this.done    = true
        this.loading = false
        this.notify.success('Password reset successfully!')
        setTimeout(() => this.router.navigate(['/auth/login']), 2000)
      },
      error: () => { this.loading = false }
    })
  }
}