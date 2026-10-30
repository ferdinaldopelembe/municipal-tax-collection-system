package mz.beira.cobranca.repositories;

import java.util.Optional;
import mz.beira.cobranca.models.Account;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByEmailIgnoreCase(String email);
    Optional<Account> findByPhone(String phone);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByPhone(String phone);
    Optional<Account> findByStallId(Long stallId);
}
