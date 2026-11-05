import { Component } from '@angular/core';
import { AuthRegisterComponent } from '@features/auth/components/auth-register-component/auth-register-component';

@Component({
  imports: [AuthRegisterComponent],
  selector: 'app-register-page',
  templateUrl: './register-page.html',
})
export class RegisterPage {}
