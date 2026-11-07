import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  error(context: string, message: string, error?: unknown): void {
    console.error(`[${context}] ${message}`, error);
  }

  warn(context: string, message: string, error?: unknown): void {
    console.warn(`[${context}] ${message}`, error);
  }

  info(context: string, message: string): void {
    console.info(`[${context}] ${message}`);
  }
}