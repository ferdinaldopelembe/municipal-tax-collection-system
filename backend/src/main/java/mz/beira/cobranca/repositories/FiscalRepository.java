package mz.beira.cobranca.repositories;

import java.util.List;
import mz.beira.cobranca.models.Fiscal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FiscalRepository extends JpaRepository<Fiscal, Long> {
    List<Fiscal> findAllByOrderByNameAsc();
    boolean existsByNuit(String nuit);
}
