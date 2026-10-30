package mz.beira.cobranca.dto;

import java.util.List;
import mz.beira.cobranca.models.Market;

public record MarketResponse(
    Long id,
    String name,
    String location,
    String manager,
    boolean active,
    long merchantCount,
    List<StallResponse> stalls
) {
    public static MarketResponse from(Market market, List<StallResponse> stalls, long merchantCount) {
        return new MarketResponse(
            market.getId(),
            market.getName(),
            market.getLocation(),
            market.getManager(),
            market.isActive(),
            merchantCount,
            stalls
        );
    }
}
