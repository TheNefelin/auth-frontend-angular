import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-message-error-component',
  templateUrl: './message-error-component.html',
})
export class MessageErrorComponent {
  readonly message = input<string | null>(null);
}
