package mz.beira.cobranca.dto;

import java.math.BigDecimal;
import mz.beira.cobranca.models.Rate;

public record RateResponse(Long id, Long marketId, String product, String periodicity, BigDecimal amount) {
    public static RateResponse from(Rate rate) {
        return new RateResponse(
            rate.getId(),
            rate.getMarket().getId(),
            rate.getProduct(),
            rate.getPeriodicity(),
            rate.getAmount()
        );
    }
}
