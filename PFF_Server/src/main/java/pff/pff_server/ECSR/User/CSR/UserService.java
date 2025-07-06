package pff.pff_server.ECSR.User.CSR;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pff.pff_server.Config.JwtService;
import pff.pff_server.ECSR.User.DTO.CreateUserDTO;
import pff.pff_server.ECSR.User.DTO.LoginResponseDTO;
import pff.pff_server.ECSR.User.DTO.UserDTO;
import pff.pff_server.ECSR.User.DTO.UserLoginDTO;
import pff.pff_server.ECSR.User.User;


import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    public LoginResponseDTO login(UserLoginDTO request){
        User user =  userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("utilisateur incorrect"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Mot de passe incorrect");
        }
        Map<String, Object> claims = new HashMap<>();
        claims.put("role",  user.getRole().name());
        claims.put("userId",  user.getId());
        String token = jwtService.generateToken(claims, user);
        return new LoginResponseDTO(token,user.getId(),user.getEmail(), user.getRole());
    }
    private UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .nom(user.getNom())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    private User toEntity(CreateUserDTO request) {
        return User.builder()
                .nom(request.getNom())
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .role(request.getRole())
                .build();
    }

    public UserDTO createUser(CreateUserDTO request) {
        Optional<User> existing = userRepository.findByEmail(request.getEmail());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Cet email est déjà utilisé");
        }

        User user = toEntity(request);

        User savedUser = userRepository.save(user);
        return toDTO(savedUser);
    }

    public UserDTO updateUser(Long id, CreateUserDTO request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        // Update fields
        user.setNom(request.getNom());
        user.setEmail(request.getEmail());

        // If password is not null or empty, update it
        if (request.getMotDePasse() != null && !request.getMotDePasse().isEmpty()) {
            user.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        }

        user.setRole(request.getRole());

        User updatedUser = userRepository.save(user);
        return toDTO(updatedUser);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        return toDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }
}
