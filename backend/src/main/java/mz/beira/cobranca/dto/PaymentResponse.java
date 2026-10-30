package mz.beira.cobranca.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import mz.beira.cobranca.models.Payment;

public record PaymentResponse(
    Long id,
    String paymentReference,
    String transactionReference,
    Long ownerId,
    String merchant,
    String phone,
    String email,
    String market,
    String stall,
    String product,
    String periodicity,
    LocalDate periodStart,
    LocalDate periodEnd,
    BigDecimal amount,
    String method,
    String status,
    LocalDateTime paidAt
) {
    public static PaymentResponse from(Payment payment) {
        return new PaymentResponse(
            payment.getId(),
            payment.getPaymentReference(),
            payment.getTransactionReference(),
            payment.getAccount().getId(),
            payment.getAccount().getName(),
            payment.getAccount().getPhone(),
            payment.getAccount().getEmail(),
            payment.getMarket().getName(),
            payment.getStall().getCode(),
            payment.getProduct(),
            payment.getPeriodicity(),
            payment.getPeriodStart(),
            payment.getPeriodEnd(),
            payment.getAmount(),
            payment.getMethod(),
            payment.getStatus(),
            payment.getPaidAt()
        );
    }
}
