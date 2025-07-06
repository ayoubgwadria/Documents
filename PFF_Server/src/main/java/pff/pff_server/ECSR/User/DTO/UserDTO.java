package pff.pff_server.ECSR.User.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pff.pff_server.ECSR.User.ENUM.Role;


import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String nom;
    private String email;
    private Role role;

}
