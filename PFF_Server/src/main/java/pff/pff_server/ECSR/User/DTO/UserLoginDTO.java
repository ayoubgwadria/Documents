package pff.pff_server.ECSR.User.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class UserLoginDTO {
    private String email;
    private String password;
}