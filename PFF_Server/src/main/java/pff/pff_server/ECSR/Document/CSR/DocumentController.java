package pff.pff_server.ECSR.Document.CSR;


import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pff.pff_server.ECSR.Document.DTO.DocumentResponseDTO;
import pff.pff_server.ECSR.Document.Document;
import pff.pff_server.ECSR.User.CSR.UserRepository;
import pff.pff_server.ECSR.User.User;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final UserRepository userRepository;

    // ✅ Upload un document
    @PostMapping("/upload")
    public ResponseEntity<Document> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("titre") String titre,
            @RequestParam("type") String type,
            @RequestParam("userId") Long userId) throws IOException {

        User professeur = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Professeur introuvable"));

        Document savedDoc = documentService.uploadDocument(file, titre, type, professeur);
        return ResponseEntity.ok(savedDoc);
    }

    // ✅ Télécharger un document par ID
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) throws IOException {
        Resource resource = documentService.downloadDocument(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    // ✅ Liste de tous les documents
    @GetMapping
    public ResponseEntity<List<DocumentResponseDTO>> getAllDocuments() {
        List<DocumentResponseDTO> documents = documentService.getAllDocuments();
        return ResponseEntity.ok(documents);
    }

    // ✅ Supprimer un document
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) throws IOException {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ Liste des documents uploadés par un professeur donné
    @GetMapping("/professeur/{userId}")
    public ResponseEntity<List<DocumentResponseDTO>> getByProf(@PathVariable Long userId) {
        User prof = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Professeur introuvable"));
        List<DocumentResponseDTO> documents = documentService.getDocumentsByProfessor(prof);
        return ResponseEntity.ok(documents);
    }
}
