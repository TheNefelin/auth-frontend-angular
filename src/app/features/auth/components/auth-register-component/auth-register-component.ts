import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthRegister } from '@features/auth/models/models';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { MessageErrorComponent } from '@shared/components/message-error-component/message-error-component';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';

@Component({
  imports: [LoadingComponent, MessageErrorComponent, FormsModule],
  selector: 'app-auth-register-component',
  templateUrl: './auth-register-component.html',
})
export class AuthRegisterComponent {
  //-- SERVICES --------------------------------
  private readonly router = inject(Router);
  
  //-- INPUTS & OUTPUTS -------------------------
  readonly isLoading = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  protected readonly submitted = output<AuthRegister>();

  //-- SIGNALS ----------------------------------
  protected readonly errorMessage = signal<string | null>(null);

  // Form de creación: sin fuente externa, por eso `signal` y no `linkedSignal`.
  protected readonly formData = signal<AuthRegister>({
    email: '',
    password: '',
    confirmPassword: '',
  });

  //-- METHODS ----------------------------------
  protected updateEmail(value: string): void {
    this.formData.update(d => ({ ...d, email: value }));
    this.errorMessage.set(null);
  }

  protected updatePassword(value: string): void {
    this.formData.update(d => ({ ...d, password: value }));
    this.errorMessage.set(null);
  }

  protected updateConfirmPassword(value: string): void {
    this.formData.update(d => ({ ...d, confirmPassword: value }));
    this.errorMessage.set(null);
  }

  protected submit(): void {
    const data = this.formData();
    const error = this.validate(data);

    if (error) {
      this.errorMessage.set(error);
      return;
    }

    this.errorMessage.set(null);
    this.submitted.emit(data);
  }

  private validate(d: AuthRegister): string | null {
    if (!d.email) return 'El email es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return 'Formato de email inválido';
    if (!d.password) return 'La contraseña es obligatoria';
    if (d.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (d.password.length > 128) return 'La contraseña es demasiado larga';
    if (d.password !== d.confirmPassword) return 'Las contraseñas no coinciden';
    return null;
  }

  protected navigateToLogin(): void {
    this.router.navigate([ROUTES_CONSTANTS.AUTH.LOGIN]);    
  }
}
