import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  error(context: string, message: string, error?: unknown): void {
    if (environment.production) return;
    console.error(`[${context}] ${message}`, error);
  }

  warn(context: string, message: string, error?: unknown): void {
    if (environment.production) return;
    console.warn(`[${context}] ${message}`, error);
  }

  info(context: string, message: string): void {
    if (environment.production) return;
    console.info(`[${context}] ${message}`);
  }
}