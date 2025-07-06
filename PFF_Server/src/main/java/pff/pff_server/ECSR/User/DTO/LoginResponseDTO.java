package pff.pff_server.ECSR.User.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import pff.pff_server.ECSR.User.ENUM.Role;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class LoginResponseDTO {

    private String token;
    private Long id;
    private String email;
    private Role role;
}