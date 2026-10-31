import { Component, input, output } from "@angular/core";
import { LoadingComponent } from "@shared/components/loading-component/loading-component";

@Component({
  imports: [LoadingComponent],
  selector: 'app-auth-google-component',
  templateUrl: './auth-google-component.html',
})
export class AuthGoogleComponent {
  readonly loading = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly login = output<void>();
}
