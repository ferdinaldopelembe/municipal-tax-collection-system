package mz.beira.cobranca.services;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.UUID;
import mz.beira.cobranca.dto.PaymentRequest;
import mz.beira.cobranca.dto.PaymentResponse;
import mz.beira.cobranca.models.Account;
import mz.beira.cobranca.models.Payment;
import mz.beira.cobranca.models.Rate;
import mz.beira.cobranca.repositories.PaymentRepository;
import mz.beira.cobranca.repositories.RateRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PaymentService {
    private final PaymentRepository payments;
    private final RateRepository rates;

    public PaymentService(PaymentRepository payments, RateRepository rates) {
        this.payments = payments;
        this.rates = rates;
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPayments(Account account) {
        List<Payment> result = "ADMIN".equals(account.getRole())
            ? payments.findAllByOrderByPaidAtDesc()
            : payments.findAllByAccountIdOrderByPaidAtDesc(account.getId());
        return result.stream().map(PaymentResponse::from).toList();
    }

    @Transactional
    public PaymentResponse makePayment(Account account, PaymentRequest request) {
        if (!"Numerário".equals(request.method())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Actualmente, só são aceites pagamentos em numerário."
            );
        }
        if (!"MERCHANT".equals(account.getRole())
            || account.getMarket() == null
            || account.getStall() == null
            || account.getProduct() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "A conta não está associada a um comerciante.");
        }
        if (!account.getMarket().isActive()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O mercado está inactivo e não aceita pagamentos.");
        }

        Rate rate = rates.findByMarketIdAndProductIgnoreCaseAndActiveTrue(
                account.getMarket().getId(),
                account.getProduct()
            )
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Não existe taxa activa para este negócio."));

        LocalDate today = LocalDate.now();
        LocalDate start;
        LocalDate end;
        switch (rate.getPeriodicity()) {
            case "Diária" -> {
                start = today;
                end = today;
            }
            case "Semanal" -> {
                start = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                end = start.plusDays(6);
            }
            case "Mensal" -> {
                start = today.withDayOfMonth(1);
                end = today.with(TemporalAdjusters.lastDayOfMonth());
            }
            default -> throw new ResponseStatusException(HttpStatus.CONFLICT, "Periodicidade da taxa inválida.");
        }
        if (payments.existsByAccountIdAndPeriodStartAndPeriodEnd(account.getId(), start, end)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "O pagamento deste período já foi registado."
            );
        }

        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
        int year = today.getYear();
        Payment payment = new Payment(
            "PAG-" + year + "-" + suffix,
            "TRX-" + year + "-" + suffix,
            account,
            account.getMarket(),
            account.getStall(),
            account.getProduct(),
            rate.getPeriodicity(),
            start,
            end,
            rate.getAmount(),
            request.method().trim(),
            LocalDateTime.now()
        );
        return PaymentResponse.from(payments.save(payment));
    }
}
