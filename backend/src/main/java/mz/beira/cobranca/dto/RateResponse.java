package mz.beira.cobranca.dto;

import java.math.BigDecimal;
import mz.beira.cobranca.models.Rate;

public record RateResponse(Long id, Long marketId, String market, String product, String periodicity,
                           BigDecimal amount, boolean active, String description, long merchants) {
    public static RateResponse from(Rate rate, long merchants) {
        return new RateResponse(
            rate.getId(),
            rate.getMarket().getId(),
            rate.getMarket().getName(),
            rate.getProduct(),
            rate.getPeriodicity(),
            rate.getAmount(),
            rate.isActive(),
            rate.getDescription(),
            merchants
        );
    }
}
