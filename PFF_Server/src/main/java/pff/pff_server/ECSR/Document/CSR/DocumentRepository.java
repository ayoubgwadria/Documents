package pff.pff_server.ECSR.Document.CSR;

import org.springframework.data.jpa.repository.JpaRepository;
import pff.pff_server.ECSR.Document.Document;
import pff.pff_server.ECSR.User.User;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByUploadedBy(User user);
}
