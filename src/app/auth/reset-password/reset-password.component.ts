import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { sanitizedForm } from '@functions/forms.function';
import { LoginRequest } from '@models/auth.model';
import { AuthStore } from '@stores/auth.store';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';

@Component({
  selector: 'app-reset-password',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MessagesModule,
  ],
  templateUrl: './reset-password.component.html',
  styles: ``,
})
export class ResetPasswordComponent {
  readonly store = inject(AuthStore);

  description =
    'Ingresa el correo electrónico asociada a tu cuenta. Te enviaremos las instrucciones para restablecer tu contraseña.';

  formData = new FormGroup({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  returnUrl!: string;

  get invalid(): boolean {
    return !this.formData.valid;
  }

  get loading(): boolean {
    return this.store.loading();
  }

  get error(): string | null {
    return this.store.error();
  }

  onSubmit() {
    const form: LoginRequest = sanitizedForm(this.formData.getRawValue());
    // this.store.login(form, this.returnUrl);
  }
}
