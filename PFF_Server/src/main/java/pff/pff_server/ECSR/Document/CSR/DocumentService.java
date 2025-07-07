package pff.pff_server.ECSR.Document.CSR;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pff.pff_server.ECSR.Document.Document;
import pff.pff_server.ECSR.Document.DTO.DocumentResponseDTO;
import pff.pff_server.ECSR.User.User;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la création du dossier upload", e);
        }
    }

    public Document uploadDocument(MultipartFile file, String titre, String type, User professeur) throws IOException {
        // Nom temporaire
        String tempFileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path tempFilePath = Paths.get(uploadDir, tempFileName);
        Files.copy(file.getInputStream(), tempFilePath, StandardCopyOption.REPLACE_EXISTING);

        // Sauvegarde du document
        Document doc = new Document();
        doc.setTitre(titre);
        doc.setType(type);
        doc.setUploadedBy(professeur);
        doc.setDateUpload(new Date());
        doc.setFichierNom(tempFileName);
        doc = documentRepository.save(doc);

        // Nom de fichier final avec l’ID
        String finalFileName = doc.getId() + "_" + file.getOriginalFilename();
        Path finalFilePath = Paths.get(uploadDir, finalFileName);
        Files.move(tempFilePath, finalFilePath, StandardCopyOption.REPLACE_EXISTING);

        // Mise à jour et sauvegarde finale
        doc.setFichierNom(finalFileName);
        return documentRepository.save(doc);
    }

    public Resource downloadDocument(Long id) throws IOException {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new IOException("Document non trouvé avec l’ID: " + id));

        Path filePath = Paths.get(uploadDir).resolve(document.getFichierNom()).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists()) {
            return resource;
        } else {
            throw new IOException("Fichier non trouvé: " + document.getFichierNom());
        }
    }

    public List<DocumentResponseDTO> getAllDocuments() {
        return documentRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<DocumentResponseDTO> getDocumentsByProfessor(User professeur) {
        return documentRepository.findByUploadedBy(professeur).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public DocumentResponseDTO getDocumentById(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document non trouvé avec l’ID: " + id));
        return mapToDTO(document);
    }

    public void deleteDocument(Long id) throws IOException {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new IOException("Document non trouvé avec l’ID: " + id));

        Path filePath = Paths.get(uploadDir).resolve(document.getFichierNom());
        Files.deleteIfExists(filePath);
        documentRepository.deleteById(id);
    }

    private DocumentResponseDTO mapToDTO(Document document) {
        String fileExtension = extractFileExtension(document.getFichierNom());
        return new DocumentResponseDTO(
                document.getId(),
                document.getTitre(),
                document.getType(),
                document.getDateUpload(),
                document.getUploadedBy().getNom(),
                document.getUploadedBy().getEmail(),
                document.getUploadedBy().getRole(),
                fileExtension // Extract file extension
        );
    }

    private String extractFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }
}