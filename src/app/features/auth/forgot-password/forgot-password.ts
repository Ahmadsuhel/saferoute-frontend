import { Component, OnInit } from '@angular/core'
import { CommonModule }      from '@angular/common'
import { RouterLink }        from '@angular/router'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'
import { AuthService }         from '../../../core/services/auth.service'
import { NotificationService } from '../../../core/services/notification.service'

@Component({
  selector:    'app-forgot-password',
  standalone:  true,
  imports:     [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl:    './forgot-password.scss'
})
export class ForgotPasswordComponent implements OnInit {

  form!:    FormGroup
  loading = false
  sent    = false

  constructor(
    private fb:     FormBuilder,
    private auth:   AuthService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    })
  }

  get email() { return this.form.get('email')! }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    this.loading = true
    this.auth.forgotPassword(this.form.value).subscribe({
      next: () => {
        this.sent    = true
        this.loading = false
      },
      error: () => { this.loading = false }
    })
  }
}