import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-root',
  imports: [CommonModule, QRCodeComponent, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  @ViewChild('qrWrapper', { static: false }) qrWrapper!: ElementRef;

  protected title = 'qr-code-generator';

  qrText: string = '';
  generatedText: string = '';
  showError: boolean = false;

  generateQr() {
    if (!this.qrText || this.qrText.trim() === '') {
      this.showError = true;
      return;
    }

    this.showError = false;
    this.generatedText = this.qrText;
  }

  downloadQR() {
    const canvas: HTMLCanvasElement =
      this.qrWrapper.nativeElement.querySelector('canvas');

    if (!canvas) return;

    const image = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    const now = new Date();
    const timestamp =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      '-' +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0'); link.href = image;
    link.download = 'qr-code' + timestamp + '.png';
    link.click();
  }
}
