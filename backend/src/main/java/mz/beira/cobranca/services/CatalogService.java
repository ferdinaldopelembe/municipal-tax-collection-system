package mz.beira.cobranca.services;

import java.util.List;
import mz.beira.cobranca.dto.MarketResponse;
import mz.beira.cobranca.dto.RateResponse;
import mz.beira.cobranca.models.Market;
import mz.beira.cobranca.repositories.MarketRepository;
import mz.beira.cobranca.repositories.RateRepository;
import mz.beira.cobranca.repositories.StallRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogService {
    private final MarketRepository markets;
    private final StallRepository stalls;
    private final RateRepository rates;

    public CatalogService(MarketRepository markets, StallRepository stalls, RateRepository rates) {
        this.markets = markets;
        this.stalls = stalls;
        this.rates = rates;
    }

    @Transactional(readOnly = true)
    public List<MarketResponse> getMarkets() {
        return markets.findAll().stream()
            .map(market -> MarketResponse.from(
                market,
                stalls.findAllByMarketIdOrderByCode(market.getId())
            ))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<RateResponse> getRates(Long marketId) {
        return rates.findAllByMarketIdAndActiveTrueOrderByProduct(marketId).stream()
            .map(RateResponse::from)
            .toList();
    }
}
