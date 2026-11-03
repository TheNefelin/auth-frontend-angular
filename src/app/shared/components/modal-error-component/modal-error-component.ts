import { Component, inject } from "@angular/core";
import { ErrorService } from "@core/services/error-service";

@Component({
  imports: [],
  selector: 'app-modal-error-component',
  templateUrl: './modal-error-component.html',
})
export class ModalErrorComponent {
  protected readonly errorService = inject(ErrorService);
}
