package pff.pff_server.ECSR.Document.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import pff.pff_server.ECSR.User.ENUM.Role;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponseDTO {
    private Long id;
    private String titre;
    private String type;
    private Date dateUpload;
    private String uploadedByName;
    private String uploadedByEmail;
    private Role role;
    private String fileExtension;
}

