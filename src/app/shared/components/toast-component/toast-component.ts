import { Component, inject } from "@angular/core";
import { ToastService } from "@core/services/toast-service";

@Component({
  imports: [],
  selector: 'app-toast-component',
  templateUrl: './toast-component.html',
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);
}
