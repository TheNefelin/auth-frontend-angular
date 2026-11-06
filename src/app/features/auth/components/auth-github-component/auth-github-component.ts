import { Component, input, output } from "@angular/core";
import { LoadingComponent } from "@shared/components/loading-component/loading-component";

@Component({
  imports: [LoadingComponent],
  selector: 'app-auth-github-component',
  templateUrl: './auth-github-component.html',
})
export class AuthGithubComponent {
  readonly isLoading = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly submitted = output<void>();
}
