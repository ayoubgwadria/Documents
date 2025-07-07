import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../core/environments';

// Interface aligned with backend DocumentResponseDTO
export interface DocumentResponse {
  id: number; // Changed to number to match TypeScript convention (Long in backend is serialized as number)
  titre: string;
  type: string;
  dateUpload: string; // Backend sends Date as ISO string
  uploadedByName: string;
  uploadedByEmail: string;
  fileExtension:string;
  role: string; // Role enum is serialized as string (e.g., "PROFESSOR")
}

// Interface aligned with backend Document entity (returned by upload endpoint)
export interface Document {
  id: number; // Long in backend, serialized as number
  titre: string;
  type: string;
  dateUpload: string; // ISO string
  fichierNom: string;
  uploadedBy: {
    id: number;
    nom: string;
    email: string;
    role: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/api/documents`;

  constructor(private http: HttpClient) {}

  // 📤 Upload document (returns Document to match backend response)
  uploadDocument(file: File, titre: string, type: string, userId: number): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('titre', titre);
    formData.append('type', type);
    formData.append('userId', userId.toString());

    return this.http.post<Document>(`${this.apiUrl}/upload`, formData);
  }

  // 📥 Download a document by ID (returns Blob for file download)
  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${id}`, {
      responseType: 'blob'
    });
  }

  // 📄 Get all documents
  getAllDocuments(): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(this.apiUrl);
  }

  // 👨‍🏫 Get documents uploaded by a professor
  getDocumentsByProfessor(userId: number): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(`${this.apiUrl}/professeur/${userId}`);
  }

  // ❌ Delete a document
  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // 🔍 Get a document by ID
  getDocumentById(id: number): Observable<DocumentResponse> {
    return this.http.get<DocumentResponse>(`${this.apiUrl}/${id}`);
  }
}