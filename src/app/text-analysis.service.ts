import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TextAnalysisService {
  private http = inject(HttpClient);

  analyzeText(text: string): Observable<any> {
    // Assuming the .NET controller is running on the same host
    // and has an endpoint at /api/textanalysis
    return this.http.post('https://myapp-1000379470338.us-central1.run.app/api/textanalysis', { text });
  }
}
