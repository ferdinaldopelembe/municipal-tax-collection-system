package mz.beira.cobranca.repositories;

import java.util.List;
import java.util.Optional;
import mz.beira.cobranca.models.Rate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RateRepository extends JpaRepository<Rate, Long> {
    List<Rate> findAllByOrderByMarketNameAscProductAsc();
    List<Rate> findAllByMarketIdAndActiveTrueOrderByProduct(Long marketId);
    Optional<Rate> findByMarketIdAndProductIgnoreCaseAndActiveTrue(Long marketId, String product);
    Optional<Rate> findByMarketIdAndProductIgnoreCase(Long marketId, String product);
    boolean existsByMarketIdAndProductIgnoreCase(Long marketId, String product);
}
