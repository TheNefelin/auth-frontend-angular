import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { UserProfile } from '@core/models/user-profile';

@Component({
  imports: [NgOptimizedImage, RouterLink],
  selector: 'app-user-details-component',
  templateUrl: './user-details-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsComponent {
  readonly profile = input.required<UserProfile>();
  readonly logout = output<void>();

  protected readonly displayName = computed(() => {
    const fullName = [this.profile().name, this.profile().lastname]
      .filter(Boolean)
      .join(' ')
      .trim();
    return fullName || this.profile().email || 'Usuario';
  });
  protected readonly initial = computed(
    () => this.displayName().trim().charAt(0).toUpperCase() || '?',
  );
  protected readonly pictureUrl = computed(
    () => this.profile().picture_url || '/images/user.jpg',
  );
}
