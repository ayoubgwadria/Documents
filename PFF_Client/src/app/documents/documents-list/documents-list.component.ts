import { Component,  OnInit } from "@angular/core"
import  { DocumentResponse, DocumentService } from "../../services/document-services.service"
import { Role,  UserServicesService } from "../../services/user-services.service"

interface QuickFilter {
  label: string
  value: string
  active: boolean
}

@Component({
  selector: "app-documents-list",
  standalone: false,
  templateUrl: "./documents-list.component.html",
  styleUrls: ["./documents-list.component.css"],
})
export class DocumentsListComponent implements OnInit {
  // Data properties
  documents: DocumentResponse[] = []
  filteredDocuments: DocumentResponse[] = []
  paginatedDocuments: DocumentResponse[] = []

  // State properties
  isLoading = false
  errorMessage = ""
  showFilters = false
  activeFiltersCount = 0

  // Search and pagination
  searchTerm = ""
  currentPage = 1
  itemsPerPage = 10
  totalPages = 1

  // Sorting
  sortColumn = ""
  sortDirection: "asc" | "desc" = "asc"

  // Filter options
  availableTypes: string[] = []
  availableRoles: string[] = []
  availableUploaders: string[] = []

  // Active filters
  selectedTypes: string[] = []
  selectedRoles: string[] = []
  selectedUploaders: string[] = []
  dateRangeStart = ""
  dateRangeEnd = ""

  // Quick filters
  quickFilters: QuickFilter[] = []

  // User info
  role: Role | null = null
  email: string | null = null

  constructor(
    private documentService: DocumentService,
    private userService: UserServicesService,
  ) {}

  ngOnInit(): void {
    this.initializeUserInfo()
    this.setupQuickFilters()
    this.loadDocuments()
  }

  // Initialization methods
  private initializeUserInfo(): void {
    this.role = this.userService.getCurrentUserRole()
    const emailValue = this.userService.getCurrentUserEmail()
    this.email = emailValue !== null ? emailValue.toString() : null
  }

  private setupQuickFilters(): void {
    this.quickFilters = [
      { label: "Aujourd'hui", value: "today", active: false },
      { label: "Cette semaine", value: "week", active: false },
      { label: "Ce mois", value: "month", active: false },
    ]

    if (this.role === Role.PROFESSOR) {
      this.quickFilters.push({
        label: "Mes documents",
        value: "mine",
        active: false,
      })
    }
  }

  private initializeFilterOptions(): void {
    this.availableTypes = [...new Set(this.documents.map((doc) => doc.type))].sort()
    this.availableRoles = [...new Set(this.documents.map((doc) => doc.role))].sort()
    this.availableUploaders = [...new Set(this.documents.map((doc) => doc.uploadedByName))].sort()
  }

  // Data loading
  loadDocuments(): void {
    this.isLoading = true
    this.errorMessage = ""

    this.documentService.getAllDocuments().subscribe({
      next: (documents) => {
        this.documents = documents
        this.initializeFilterOptions()
        this.applyFilters()
        this.isLoading = false
      },
      error: (error) => {
        console.error("Error fetching documents:", error)
        this.errorMessage = "Failed to load documents. Please try again."
        this.isLoading = false
      },
    })
  }

  refreshDocuments(): void {
    this.loadDocuments()
  }

  // Filter methods
  toggleFilters(): void {
    this.showFilters = !this.showFilters
  }

  applyFilters(): void {
    let filtered = [...this.documents]

    // Apply search filter
    filtered = this.applySearchFilter(filtered)

    // Apply type filters
    filtered = this.applyTypeFilter(filtered)

    // Apply role filters
    filtered = this.applyRoleFilter(filtered)

    // Apply uploader filters
    filtered = this.applyUploaderFilter(filtered)

    // Apply date range filters
    filtered = this.applyDateRangeFilter(filtered)

    this.filteredDocuments = filtered
    this.currentPage = 1
    this.updateActiveFiltersCount()
    this.updatePagination()
  }

  private applySearchFilter(documents: DocumentResponse[]): DocumentResponse[] {
    if (!this.searchTerm.trim()) return documents

    const term = this.searchTerm.toLowerCase()
    return documents.filter(
      (doc) =>
        doc.titre.toLowerCase().includes(term) ||
        doc.type.toLowerCase().includes(term) ||
        doc.uploadedByName.toLowerCase().includes(term) ||
        doc.uploadedByEmail.toLowerCase().includes(term) ||
        doc.role.toLowerCase().includes(term),
    )
  }

  private applyTypeFilter(documents: DocumentResponse[]): DocumentResponse[] {
    if (this.selectedTypes.length === 0) return documents
    return documents.filter((doc) => this.selectedTypes.includes(doc.type))
  }

  private applyRoleFilter(documents: DocumentResponse[]): DocumentResponse[] {
    if (this.selectedRoles.length === 0) return documents
    return documents.filter((doc) => this.selectedRoles.includes(doc.role))
  }

  private applyUploaderFilter(documents: DocumentResponse[]): DocumentResponse[] {
    if (this.selectedUploaders.length === 0) return documents
    return documents.filter((doc) => this.selectedUploaders.includes(doc.uploadedByName))
  }

  private applyDateRangeFilter(documents: DocumentResponse[]): DocumentResponse[] {
    let filtered = documents

    if (this.dateRangeStart) {
      const startDate = new Date(this.dateRangeStart)
      filtered = filtered.filter((doc) => new Date(doc.dateUpload) >= startDate)
    }

    if (this.dateRangeEnd) {
      const endDate = new Date(this.dateRangeEnd)
      endDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter((doc) => new Date(doc.dateUpload) <= endDate)
    }

    return filtered
  }

  // Filter event handlers
  onSearch(): void {
    this.applyFilters()
  }

  onTypeFilterChange(type: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked
    this.updateFilterArray(this.selectedTypes, type, checked)
    this.applyFilters()
  }

  onRoleFilterChange(role: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked
    this.updateFilterArray(this.selectedRoles, role, checked)
    this.applyFilters()
  }

  onUploaderFilterChange(uploader: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked
    this.updateFilterArray(this.selectedUploaders, uploader, checked)
    this.applyFilters()
  }

  onDateRangeChange(): void {
    this.applyFilters()
  }

  private updateFilterArray(array: string[], value: string, add: boolean): void {
    if (add && !array.includes(value)) {
      array.push(value)
    } else if (!add) {
      const index = array.indexOf(value)
      if (index > -1) {
        array.splice(index, 1)
      }
    }
  }

  // Quick filters
  toggleQuickFilter(filterValue: string): void {
    const filter = this.quickFilters.find((f) => f.value === filterValue)
    if (filter) {
      filter.active = !filter.active
      this.applyQuickFilter(filterValue, filter.active)
    }
  }

  private applyQuickFilter(filterValue: string, active: boolean): void {
    const today = new Date()

    switch (filterValue) {
      case "today":
        this.setDateRange(active, today, today)
        break
      case "week":
        const startOfWeek = new Date()
        startOfWeek.setDate(today.getDate() - today.getDay())
        this.setDateRange(active, startOfWeek, today)
        break
      case "month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        this.setDateRange(active, startOfMonth, today)
        break
      case "pdf":
        this.setTypeFilter(active, "PDF")
        break
      case "mine":
        this.setMyDocumentsFilter(active)
        break
    }

    this.applyFilters()
  }

  private setDateRange(active: boolean, startDate?: Date, endDate?: Date): void {
    if (active && startDate && endDate) {
      this.dateRangeStart = this.formatDateForInput(startDate)
      this.dateRangeEnd = this.formatDateForInput(endDate)
    } else {
      this.dateRangeStart = ""
      this.dateRangeEnd = ""
    }
  }

  private setTypeFilter(active: boolean, type: string): void {
    if (active) {
      this.selectedTypes = [type]
    } else {
      this.selectedTypes = this.selectedTypes.filter((t) => t !== type)
    }
  }

  private setMyDocumentsFilter(active: boolean): void {
    if (!this.email) return

    if (active) {
      // Filter by current user's name (since we're filtering by uploadedByName)
      const currentUserName = this.documents.find((doc) => doc.uploadedByEmail === this.email)?.uploadedByName

      if (currentUserName && !this.selectedUploaders.includes(currentUserName)) {
        this.selectedUploaders.push(currentUserName)
      }
    } else {
      // Remove current user's name from filter
      const currentUserName = this.documents.find((doc) => doc.uploadedByEmail === this.email)?.uploadedByName

      if (currentUserName) {
        this.selectedUploaders = this.selectedUploaders.filter((u) => u !== currentUserName)
      }
    }
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split("T")[0]
  }

  // Clear filters
  clearAllFilters(): void {
    this.selectedTypes = []
    this.selectedRoles = []
    this.selectedUploaders = []
    this.dateRangeStart = ""
    this.dateRangeEnd = ""
    this.searchTerm = ""
    this.quickFilters.forEach((filter) => (filter.active = false))
    this.applyFilters()
  }

  clearFilter(filterType: string, value?: string): void {
    switch (filterType) {
      case "type":
        if (value) {
          this.selectedTypes = this.selectedTypes.filter((t) => t !== value)
        }
        break
      case "role":
        if (value) {
          this.selectedRoles = this.selectedRoles.filter((r) => r !== value)
        }
        break
      case "uploader":
        if (value) {
          this.selectedUploaders = this.selectedUploaders.filter((u) => u !== value)
        }
        break
      case "dateRange":
        this.dateRangeStart = ""
        this.dateRangeEnd = ""
        break
      case "search":
        this.searchTerm = ""
        break
    }
    this.applyFilters()
  }

  private updateActiveFiltersCount(): void {
    this.activeFiltersCount =
      this.selectedTypes.length +
      this.selectedRoles.length +
      this.selectedUploaders.length +
      (this.dateRangeStart ? 1 : 0) +
      (this.dateRangeEnd ? 1 : 0) +
      (this.searchTerm ? 1 : 0)
  }

  // Document actions
viewDocument(id: number, fileExtension: string): void {
  this.documentService.downloadDocument(id).subscribe({
    next: (blob: Blob) => {
      const mimeTypes: { [key: string]: string } = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        txt: 'text/plain',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png'
      };

      const mimeType = mimeTypes[fileExtension.toLowerCase()] || 'application/octet-stream';
      const newBlob = new Blob([blob], { type: mimeType });

      const canBeViewed = ['pdf', 'txt', 'jpg', 'jpeg', 'png'].includes(fileExtension.toLowerCase());

      if (canBeViewed) {
        // Fichiers visualisables directement
        const url = window.URL.createObjectURL(newBlob);
        const newWindow = window.open(url, '_blank');

        if (newWindow) {
          newWindow.document.title = `Document Viewer - ${fileExtension.toUpperCase()}`;
          newWindow.onload = () => {
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
          };
        } else {
          this.downloadDocument(id, newBlob);
        }
      } else {
        // Fichiers non visualisables — demander confirmation
        const confirmDownload = window.confirm(`Le fichier .${fileExtension} ne peut pas être affiché directement. Voulez-vous le télécharger ?`);
        if (confirmDownload) {
          this.downloadDocument(id, newBlob,fileExtension);
        }
      }
    },
    error: (error) => {
      console.error(`Error viewing document:`, error);
      alert('Échec lors de l’ouverture du document. Veuillez réessayer.');
    },
  });
}




downloadDocument(id: number, blob?: Blob, fileExtension: string = 'pdf'): void {
  const extension = fileExtension.toLowerCase();

  if (blob) {
    this.createDownloadLink(blob, `document_${id}.${extension}`);
  } else {
    this.documentService.downloadDocument(id).subscribe({
      next: (downloadBlob) => {
        this.createDownloadLink(downloadBlob, `document_${id}.${extension}`);
      },
      error: (error) => {
        console.error("Error downloading document:", error);
        alert("Failed to download document. Please try again.");
      },
    });
  }
}


  private createDownloadLink(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  deleteDocument(id: number): void {
    const document = this.documents.find((doc) => doc.id === id)
    const confirmMessage = document
      ? `Êtes-vous sûr de vouloir supprimer "${document.titre}"?`
      : "Êtes-vous sûr de vouloir supprimer ce document?"

    if (confirm(confirmMessage)) {
      this.documentService.deleteDocument(id).subscribe({
        next: () => {
          this.loadDocuments()
          alert("Document supprimé avec succès.")
        },
        error: (error) => {
          console.error("Error deleting document:", error)
          alert("Échec de la suppression du document. Veuillez réessayer.")
        },
      })
    }
  }

  // Sorting
  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc"
    } else {
      this.sortColumn = column
      this.sortDirection = "asc"
    }

    this.filteredDocuments.sort((a, b) => {
      let valueA = a[column as keyof DocumentResponse]
      let valueB = b[column as keyof DocumentResponse]

      if (column === "dateUpload") {
        valueA = new Date(valueA as string).getTime()
        valueB = new Date(valueB as string).getTime()
      }

      if (typeof valueA === "string" && typeof valueB === "string") {
        valueA = valueA.toLowerCase()
        valueB = valueB.toLowerCase()
      }

      const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0
      return this.sortDirection === "asc" ? comparison : -comparison
    })

    this.updatePagination()
  }

  // Pagination
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredDocuments.length / this.itemsPerPage)
    const startIndex = (this.currentPage - 1) * this.itemsPerPage
    const endIndex = startIndex + this.itemsPerPage
    this.paginatedDocuments = this.filteredDocuments.slice(startIndex, endIndex)
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page
      this.updatePagination()
    }
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1)
  }

  // Utility methods
  trackByDocumentId(index: number, document: DocumentResponse): number {
    return document.id
  }

  getFileIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      xls: "📊",
      xlsx: "📊",
      ppt: "📋",
      pptx: "📋",
      txt: "📃",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      gif: "🖼️",
      zip: "📦",
      rar: "📦",
    }
    return iconMap[type.toLowerCase()] || "📄"
  }
}
