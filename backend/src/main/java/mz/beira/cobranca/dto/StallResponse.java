package mz.beira.cobranca.dto;

import mz.beira.cobranca.models.Stall;

public record StallResponse(Long id, Long marketId, String code, String product,
                            String merchant, boolean occupied) {
    public static StallResponse from(Stall stall) {
        return new StallResponse(stall.getId(), stall.getMarket().getId(), stall.getCode(),
            stall.getProduct(), null, false);
    }

    public static StallResponse from(Stall stall, String merchant, String product) {
        return new StallResponse(stall.getId(), stall.getMarket().getId(), stall.getCode(),
            product == null ? stall.getProduct() : product, merchant, merchant != null);
    }
}
