package mz.beira.cobranca.repositories;

import java.util.Optional;
import java.util.List;
import mz.beira.cobranca.models.Account;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByEmailIgnoreCase(String email);
    Optional<Account> findByPhone(String phone);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByPhone(String phone);
    boolean existsByNuit(String nuit);
    Optional<Account> findByStallId(Long stallId);
    List<Account> findAllByRoleOrderByNameAsc(String role);
    long countByMarketIdAndRole(Long marketId, String role);
    long countByMarketIdAndProductIgnoreCaseAndRole(Long marketId, String product, String role);
}
