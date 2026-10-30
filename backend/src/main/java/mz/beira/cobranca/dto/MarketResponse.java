package mz.beira.cobranca.dto;

import java.util.List;
import mz.beira.cobranca.models.Market;
import mz.beira.cobranca.models.Stall;

public record MarketResponse(Long id, String name, List<StallResponse> stalls) {
    public static MarketResponse from(Market market, List<Stall> stalls) {
        return new MarketResponse(
            market.getId(),
            market.getName(),
            stalls.stream().map(StallResponse::from).toList()
        );
    }
}
