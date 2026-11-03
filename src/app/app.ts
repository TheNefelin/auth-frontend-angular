import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalErrorComponent } from '@shared/components/modal-error-component/modal-error-component';
import { ToastComponent } from '@shared/components/toast-component/toast-component';

@Component({
  imports: [RouterOutlet, ModalErrorComponent, ToastComponent],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend-python');
}
