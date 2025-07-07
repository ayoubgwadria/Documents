package pff.pff_server.ECSR.Document;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import pff.pff_server.ECSR.User.User;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String titre;

    private String type;

    private Date dateUpload;

    private String fichierNom;

    @Nullable
    private String fileExtension;

    @ManyToOne
    private User uploadedBy ;


}
