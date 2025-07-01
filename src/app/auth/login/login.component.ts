import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthStore } from '@stores/auth.store';
import { LoginRequest } from '@models/auth.model';
import { CheckboxModule } from 'primeng/checkbox';
import { sanitizedForm } from '@functions/forms.function';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    MessagesModule,
  ],
  templateUrl: './login.component.html',
  styles: ``,
})
export class LoginComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly store = inject(AuthStore);

  formData = new FormGroup({
    username: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    rememberMe: new FormControl<boolean>(false, {
      nonNullable: true,
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

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit() {
    const form: LoginRequest = sanitizedForm(this.formData.getRawValue());
    this.store.login(form, this.returnUrl);
  }
}
