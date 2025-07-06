package pff.pff_server.ECSR.User.CSR;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pff.pff_server.ECSR.User.DTO.CreateUserDTO;
import pff.pff_server.ECSR.User.DTO.LoginResponseDTO;
import pff.pff_server.ECSR.User.DTO.UserDTO;
import pff.pff_server.ECSR.User.DTO.UserLoginDTO;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    @Autowired
    private  UserService userService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login (@RequestBody UserLoginDTO request){
        return ResponseEntity.ok(userService.login(request));
    }

    // Create user
    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody CreateUserDTO request) {
        UserDTO createdUser = userService.createUser(request);
        return ResponseEntity.ok(createdUser);
    }

    // Update user by id
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody CreateUserDTO request) {
        UserDTO updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    // Delete user by id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // Get user by id
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    // Get all users
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
}
