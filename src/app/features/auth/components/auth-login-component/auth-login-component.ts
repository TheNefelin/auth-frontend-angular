import { Component, input, output } from "@angular/core";
import { LoadingComponent } from "@shared/components/loading-component/loading-component";

@Component({
  imports: [LoadingComponent],
  selector: 'app-auth-login-component',
  templateUrl: './auth-login-component.html',
})
export class AuthLoginComponent {
  readonly loading = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly login = output<void>();
}
