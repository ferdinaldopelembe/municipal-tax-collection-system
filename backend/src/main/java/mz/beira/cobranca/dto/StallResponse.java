package mz.beira.cobranca.dto;

import mz.beira.cobranca.models.Stall;

public record StallResponse(Long id, String code) {
    public static StallResponse from(Stall stall) {
        return new StallResponse(stall.getId(), stall.getCode());
    }
}
