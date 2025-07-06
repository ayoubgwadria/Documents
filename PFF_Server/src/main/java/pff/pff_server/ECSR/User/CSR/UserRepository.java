package pff.pff_server.ECSR.User.CSR;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pff.pff_server.ECSR.User.User;

import java.util.Optional;
@Repository

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByNom(String nom);
    Optional<User> findByEmail(String email);

}
