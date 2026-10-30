package mz.beira.cobranca.repositories;

import java.util.List;
import java.time.LocalDateTime;
import mz.beira.cobranca.models.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findAllByAccountIdOrderByPaidAtDesc(Long accountId);
    List<Payment> findAllByOrderByPaidAtDesc();
    List<Payment> findAllByPaidAtGreaterThanEqualAndPaidAtLessThanOrderByPaidAtDesc(
        LocalDateTime from, LocalDateTime until
    );
    boolean existsByAccountIdAndPeriodStartAndPeriodEnd(Long accountId, java.time.LocalDate periodStart,
                                                        java.time.LocalDate periodEnd);
}
