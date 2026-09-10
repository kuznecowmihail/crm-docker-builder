import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/** Данные диалога подтверждения */
export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="confirm-dialog-title">
      <mat-icon>warning_amber</mat-icon>
      {{ data.title }}
    </h2>
    <mat-dialog-content class="confirm-dialog-message">{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">{{ data.cancelText || 'Отмена' }}</button>
      <button mat-flat-button color="warn" (click)="dialogRef.close(true)">{{ data.confirmText || 'Удалить' }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .confirm-dialog-title { display: flex; align-items: center; gap: 0.5rem; }
    .confirm-dialog-title mat-icon { color: #d93025; }
    .confirm-dialog-message { white-space: pre-line; max-width: 420px; }
  `]
})
export class ConfirmDialog {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ConfirmDialog>);
}
