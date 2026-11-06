import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthRegisterComponent } from '@features/auth/components/auth-register-component/auth-register-component';
import { AuthService } from '@features/auth/services/auth-service';
import { RegisterForm } from '@features/auth/models/models';
import { AuthStoreService } from '@core/services/auth-store-service';
import { ToastService } from '@core/services/toast-service';
import { ErrorService } from '@core/services/error-service';
import { LoggerService } from '@core/services/logger-service';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';

@Component({
  imports: [AuthRegisterComponent],
  selector: 'app-register-page',
  templateUrl: './register-page.html',
})
export class RegisterPage {
  private readonly authService = inject(AuthService);
  private readonly authStoreService = inject(AuthStoreService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly errorService = inject(ErrorService);
  private readonly loggerService = inject(LoggerService);

  protected readonly loading = signal<boolean>(false);

  protected async register(form: RegisterForm): Promise<void> {
    this.loading.set(true);

    try {
      await firstValueFrom(this.authService.register(form));

      this.authStoreService.setSession();

      this.toastService.show('Registro exitoso', 'success');
      await this.router.navigate([ROUTES_CONSTANTS.HOME]);
    } catch (error: unknown) {
      this.loggerService.error('RegisterPage', 'register', error);
      // HTTP: el errorInterceptor ya mostró el toast; no duplicarlo aquí.
      if (!(error instanceof HttpErrorResponse)) {
        this.errorService.show(this.describeError(error));
      }
    } finally {
      this.loading.set(false);
    }
  }

  private describeError(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return 'Error al registrarse. Intenta nuevamente.';
  }
}
