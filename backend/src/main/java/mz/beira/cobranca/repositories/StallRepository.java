package mz.beira.cobranca.repositories;

import java.util.List;
import java.util.Optional;
import mz.beira.cobranca.models.Stall;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StallRepository extends JpaRepository<Stall, Long> {
    Optional<Stall> findByIdAndMarketId(Long id, Long marketId);
    List<Stall> findAllByMarketIdOrderByCode(Long marketId);
    boolean existsByMarketIdAndCode(Long marketId, String code);
}
