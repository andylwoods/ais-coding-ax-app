import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TextAnalysisService } from './text-analysis.service';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';
import { ToastComponent } from './toast.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ToastComponent]
})
export class AppComponent {
  private textAnalysisService = inject(TextAnalysisService);
  private toastService = inject(ToastService);
  isFileSelected = signal(false);
  selectedFile: File | null = null;
  analysisResult = signal<any>(undefined);
  selectedFileName = signal('No file chosen');
  isLoading = signal(false);
  outputFormat = signal<'json' | 'xml'>('json');

  slowBikeCount = computed(() => {
    const result = this.analysisResult();
    if (!result) return 0;

    if (this.outputFormat() === 'json') {
      return result.slowBikeCount;
    } else {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(result, 'application/xml');
      const count = xmlDoc.querySelector('slowBikeCount')?.textContent;
      return count ? parseInt(count, 10) : 0;
    }
  });

  consonantCountsArray = computed(() => {
    const result = this.analysisResult();
    if (!result) return [];

    if (this.outputFormat() === 'json') {
      if (!result.consonantCounts) return [];
      return Object.entries(result.consonantCounts).map(([key, value]) => ({ key, value }));
    } else {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(result, 'application/xml');
      const consonantNodes = xmlDoc.querySelectorAll('consonant');
      return Array.from(consonantNodes).map(node => ({
        key: node.querySelector('letter')?.textContent || '',
        value: parseInt(node.querySelector('count')?.textContent || '0', 10)
      }));
    }
  });

  onFileSelected(event: Event): void {
    this.analysisResult.set(undefined);
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.isFileSelected.set(true);
      this.selectedFile = input.files[0];
      this.selectedFileName.set(this.selectedFile.name);
    } else {
      this.isFileSelected.set(false);
      this.selectedFile = null;
      this.selectedFileName.set('No file chosen');
    }
  }

  analyzeText(): void {
    if (this.selectedFile) {
      this.isLoading.set(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        this.textAnalysisService.analyzeText(text, this.outputFormat()).subscribe({
          next: result => {
            this.analysisResult.set(result);
            this.isLoading.set(false);
          },
          error: err => {
            console.error('Error during text analysis:', err);
            this.toastService.show('An error occurred during analysis.');
            this.isLoading.set(false);
          }
        });
      };
      reader.readAsText(this.selectedFile);
    }
  }

  clearFile(): void {
    this.isFileSelected.set(false);
    this.selectedFile = null;
    this.selectedFileName.set('No file chosen');
    this.analysisResult.set(undefined);
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  downloadResults(): void {
    const result = this.analysisResult();
    if (result) {
      const format = this.outputFormat();
      const isJson = format === 'json';
      const blob = new Blob([isJson ? JSON.stringify(result, null, 2) : result], { type: isJson ? 'application/json' : 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-results.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }

  setOutputFormat(format: 'json' | 'xml'): void {
    this.outputFormat.set(format);
    this.analysisResult.set(undefined);
  }
}
