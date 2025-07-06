import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocumentService } from '../../services/document-services.service';
import { Role, UserServicesService } from '../../services/user-services.service';

@Component({
  selector: 'app-add-document',
  standalone: false,
  templateUrl: './add-document.component.html',
  styleUrls: ['./add-document.component.css']
})
export class AddDocumentComponent implements OnInit {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  message: string = '';
  loading: boolean = false;
  uploadProgress: number = 0;
  isDragOver: boolean = false;
  previewUrl: string | null = null;
  id: string | null = null;
  // Allowed file types and their icons
  allowedTypes = {
    'application/pdf': { icon: '📄', name: 'PDF' },
    'application/msword': { icon: '📝', name: 'Word' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: '📝', name: 'Word' },
    'application/vnd.ms-excel': { icon: '📊', name: 'Excel' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: '📊', name: 'Excel' },
    'application/vnd.ms-powerpoint': { icon: '📋', name: 'PowerPoint' },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: '📋', name: 'PowerPoint' },
    'text/plain': { icon: '📄', name: 'Text' },
    'image/jpeg': { icon: '🖼️', name: 'Image' },
    'image/png': { icon: '🖼️', name: 'Image' },
    'image/gif': { icon: '🖼️', name: 'Image' }
  };

  documentTypes = [
    { value: 'COURS', label: 'Cours' },
    { value: 'TD', label: 'Travaux Dirigés' },
    { value: 'TP', label: 'Travaux Pratiques' },
    { value: 'EXAMEN', label: 'Examen' },
    { value: 'CORRECTION', label: 'Correction' },
    { value: 'PROJET', label: 'Projet' },
    { value: 'RESSOURCE', label: 'Ressource' },
    { value: 'AUTRE', label: 'Autre' }
  ];

  maxFileSize = 10 * 1024 * 1024; // 10MB
document: any;

  constructor(private fb: FormBuilder, private documentService: DocumentService,private userService: UserServicesService) {
    this.uploadForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      type: ['', Validators.required],
      description: ['', [Validators.maxLength(500)]],
      file: [null, Validators.required]
    });
  }
   ngOnInit(): void {
    const userId = this.userService.getCurrentUserId();
    this.id = userId !== null ? userId.toString() : null;
   
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  handleFile(file: File): void {
    // Validate file type
    if (!this.allowedTypes[file.type as keyof typeof this.allowedTypes]) {
      this.message = '❌ Type de fichier non autorisé. Veuillez sélectionner un fichier PDF, Word, Excel, PowerPoint, texte ou image.';
      return;
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      this.message = '❌ Le fichier est trop volumineux. Taille maximale autorisée : 10MB.';
      return;
    }

    this.selectedFile = file;
    this.uploadForm.patchValue({ file: file });
    this.message = '';

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = null;
    }

    // Auto-fill title if empty
    if (!this.uploadForm.get('titre')?.value) {
      const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      this.uploadForm.patchValue({ titre: fileName });
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.uploadForm.patchValue({ file: null });
    this.message = '';
    
    // Reset file input
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getFileIcon(file: File): string {
    return this.allowedTypes[file.type as keyof typeof this.allowedTypes]?.icon || '📄';
  }

  getFileTypeName(file: File): string {
    return this.allowedTypes[file.type as keyof typeof this.allowedTypes]?.name || 'Fichier';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFieldError(fieldName: string): string {
    const field = this.uploadForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} est requis`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `Minimum ${requiredLength} caractères requis`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `Maximum ${maxLength} caractères autorisés`;
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      titre: 'Le titre',
      type: 'Le type',
      description: 'La description',
      file: 'Le fichier'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.uploadForm.get(fieldName);
    return !!(field && field.errors && field.touched);
  }

  onSubmit(): void {
    if (this.uploadForm.invalid || !this.selectedFile) {
      this.markFormGroupTouched();
      this.message = '❌ Veuillez remplir tous les champs requis et sélectionner un fichier.';
      return;
    }

    const { titre, type, description } = this.uploadForm.value;
    const userId = this.id !== null ? Number(this.id) : null;

    if (userId === null || isNaN(userId)) {
      this.message = '❌ Utilisateur non valide. Veuillez vous reconnecter.';
      return;
    }

    this.loading = true;
    this.uploadProgress = 0;
    this.message = '';

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += Math.random() * 10;
      }
    }, 200);

    this.documentService.uploadDocument(this.selectedFile, titre, type, userId).subscribe({
      next: (res) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        this.message = `✅ Document "${res.titre}" téléchargé avec succès !`;
        
        // Reset form after success
        setTimeout(() => {
          this.resetForm();
        }, 2000);
      },
      error: (err) => {
        clearInterval(progressInterval);
        console.error(err);
        this.message = '❌ Erreur lors du téléversement. Veuillez réessayer.';
        this.uploadProgress = 0;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.uploadForm.reset();
    this.selectedFile = null;
    this.previewUrl = null;
    this.uploadProgress = 0;
    this.message = '';
    
    // Reset file input
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.uploadForm.controls).forEach(key => {
      const control = this.uploadForm.get(key);
      control?.markAsTouched();
    });
  }

  triggerFileInput() {
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }
}
