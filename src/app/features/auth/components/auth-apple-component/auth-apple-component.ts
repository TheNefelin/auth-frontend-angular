import { Component, input, output } from "@angular/core";
import { LoadingComponent } from "@shared/components/loading-component/loading-component";

@Component({
  imports: [LoadingComponent],
  selector: 'app-auth-apple-component',
  templateUrl: './auth-apple-component.html',
})
export class AuthAppleComponent {
  readonly loading = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly login = output<void>();
}
