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

  consonantCountsArray = computed(() => {
    const result = this.analysisResult();
    if (!result || !result.consonantCounts) {
      return [];
    }
    return Object.entries(result.consonantCounts).map(([key, value]) => ({ key, value }));
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
}
