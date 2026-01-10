import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TextAnalysisService {
  private http = inject(HttpClient);

  analyzeText(text: string, outputFormat: 'json' | 'xml'): Observable<any> {
    const body = { text, outputFormat };

    if (outputFormat === 'xml') {
      return this.http.post(
        'https://ais-api-backend-1000379470338.us-central1.run.app/api/TextAnalysis',
        body,
        { responseType: 'text' }
      );
    } else {
      return this.http.post(
        'https://ais-api-backend-1000379470338.us-central1.run.app/api/TextAnalysis',
        body
      );
    }
  }
}
