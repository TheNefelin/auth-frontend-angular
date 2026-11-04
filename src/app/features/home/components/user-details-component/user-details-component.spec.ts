import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UserDetailsComponent } from './user-details-component';
import type { UserProfile } from '@core/models/user-profile';

describe('UserDetailsComponent', () => {
  let component: UserDetailsComponent;
  let fixture: ComponentFixture<UserDetailsComponent>;

  const profile: UserProfile = {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    email: 'user@example.com',
    name: 'Demo User',
    lastname: 'Demo',
    picture_url: null,
    email_verified: true,
    is_active: true,
    role: 'user',
    status: 'activo',
    provider: 'google',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetailsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('profile', profile);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the profile name and email', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Demo User Demo');
    expect(text).toContain('user@example.com');
  });
});
