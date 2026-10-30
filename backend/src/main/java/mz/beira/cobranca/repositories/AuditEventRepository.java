package mz.beira.cobranca.repositories;

import java.util.List;
import mz.beira.cobranca.models.AuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {
    List<AuditEvent> findAllByOrderByOccurredAtDesc();
}
