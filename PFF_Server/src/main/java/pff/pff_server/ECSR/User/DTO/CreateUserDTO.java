package pff.pff_server.ECSR.User.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pff.pff_server.ECSR.User.ENUM.Role;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class CreateUserDTO {
    private String nom;
    private String email;
    private String motDePasse;
    private Role role;
}
