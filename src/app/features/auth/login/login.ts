import { Component, OnInit }  from '@angular/core'
import { CommonModule }       from '@angular/common'
import { RouterLink, ActivatedRoute, Router } from '@angular/router'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'
import { AuthService }         from '../../../core/services/auth.service'
import { NotificationService } from '../../../core/services/notification.service'

@Component({
  selector:    'app-login',
  standalone:  true,
  imports:     [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl:    './login.scss'
})
export class LoginComponent implements OnInit {

  form!:    FormGroup
  loading = false
  showPass = false

  constructor(
    private fb:     FormBuilder,
    private auth:   AuthService,
    private notify: NotificationService,
    private router: Router,
    private route:  ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    })

    this.route.queryParams.subscribe(params => {
      if (params['accessToken']) {
        const storage = (this.auth as any).storage
        storage.set('accessToken',  params['accessToken'])
        storage.set('refreshToken', params['refreshToken'])
        this.auth.getMe().subscribe(() => {
          this.router.navigate(['/home'])
        })
      }
      if (params['error']) {
        this.notify.error(params['error'])
      }
    })
  }

  get email()    { return this.form.get('email')! }
  get password() { return this.form.get('password')! }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    this.loading = true
    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.notify.success('Welcome back!')
        this.router.navigate(['/home'])
      },
      error: () => { this.loading = false }
    })
  }

  loginWithGoogle(): void {
    this.auth.googleLogin()
  }
}