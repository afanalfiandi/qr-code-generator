import { CommonModule } from '@angular/common';
import { Component, ElementRef, model, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BrowserMultiFormatReader } from '@zxing/library';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  imports: [CommonModule, QRCodeComponent, FormsModule, ZXingScannerModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  @ViewChild('qrWrapper', { static: false }) qrWrapper!: ElementRef;
  currentDevice: MediaDeviceInfo | undefined;
  qrReader = new BrowserMultiFormatReader;

  protected title = 'qr-code-generator';

  qrText = model<string>('');
  generatedText = signal<string>('');
  showError = signal<boolean>(false);
  isScanMode = signal<boolean>(false);
  activeTab = signal<number>(0);
  imgResult!: string;
  isScanSuccess = signal<boolean>(false);
  pushToScanResult = signal<boolean>(false);
  isScanModalOpen = signal<boolean>(false);

  tabs: {
    label: string;
    value: number
  }[] = [
      {
        label: "Generate QR",
        value: 0
      },
      {
        label: "Scan QR",
        value: 1
      },
    ];

  generateQr() {
    if (!this.qrText() || this.qrText().trim() === '') {
      this.showError.set(true);
      return;
    }

    this.showError.set(false);
    this.generatedText = this.qrText;
    this.activeTab.set(0);
    this.pushToScanResult.set(false);
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

  onScan() {
    this.isScanMode.set(true);
  }

  handleQrCodeResult(result: string) {
    console.log('QR Result:', result);
    this.isScanMode.set(false);

    this.qrText.set(result);
    this.isScanSuccess.set(true);
    this.pushToScanResult.set(true);
    this.closeScanModal();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files.length) {
      this.readFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.readFile(file);
    }
  }

  readFile(file: File) {
    const reader = new FileReader();

    reader.onload = async () => {
      const img = new Image();
      img.src = reader.result as string;

      img.onload = async () => {
        try {
          const result = await this.qrReader.decodeFromImageElement(img);
          this.showToast('success', 'Success scan QR from the file!');
          this.imgResult = img.src;
          this.qrText.set(result.getText());
          this.isScanSuccess.set(true);
          this.pushToScanResult.set(true);
          // this.generatedText.set('')
        } catch (err) {
          this.showToast('error', 'Failed to scan QR from the file!');
          console.error("QR not detected", err);
        }
      };
    };

    reader.readAsDataURL(file);
  }

  private showToast(icon: 'success' | 'error' | 'info', message: string) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: icon,
      title: message,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  }

  onCodeResult(result: string) {
    console.log('QR Result:', result);

    this.showToast('success', 'QR Code scanned successfully!');

    this.generatedText.set(result);
  }

  onCopy() {

  }

  openScanModal() {
    this.isScanModalOpen.set(true);
  }

  closeScanModal() {
    this.isScanModalOpen.set(false);
  }
}
