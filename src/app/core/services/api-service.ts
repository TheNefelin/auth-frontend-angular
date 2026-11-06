import { HttpClient } from '@angular/common/http';
import { inject, Service } from "@angular/core";
import { environment } from '@environments/environment';

@Service()
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getAll<TResponse>(endpoint: string) {
    return this.http.get<TResponse>(`${this.baseUrl}/${endpoint}`);
  }

  getById<TResponse>(endpoint: string, id: number) {
    return this.http.get<TResponse>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  create<TResponse, TBody>(endpoint: string, body: TBody) {
    return this.http.post<TResponse>(`${this.baseUrl}/${endpoint}`, body);
  }

  post<TResponse>(endpoint: string) {
    return this.http.post<TResponse>(`${this.baseUrl}/${endpoint}`, {});
  }

  update<TResponse, TBody>(endpoint: string, id: number, body: TBody) {
    return this.http.put<TResponse>(`${this.baseUrl}/${endpoint}/${id}`, body);
  }

  delete<TResponse>(endpoint: string, id: number) {
    return this.http.delete<TResponse>(`${this.baseUrl}/${endpoint}/${id}`);
  }
}
