package mz.beira.cobranca.services;

import java.util.List;
import mz.beira.cobranca.dto.MarketResponse;
import mz.beira.cobranca.dto.RateResponse;
import mz.beira.cobranca.models.Market;
import mz.beira.cobranca.repositories.MarketRepository;
import mz.beira.cobranca.repositories.RateRepository;
import mz.beira.cobranca.repositories.StallRepository;
import mz.beira.cobranca.repositories.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogService {
    private final MarketRepository markets;
    private final StallRepository stalls;
    private final RateRepository rates;
    private final AccountRepository accounts;

    public CatalogService(MarketRepository markets, StallRepository stalls, RateRepository rates,
                          AccountRepository accounts) {
        this.markets = markets;
        this.stalls = stalls;
        this.rates = rates;
        this.accounts = accounts;
    }

    @Transactional(readOnly = true)
    public List<MarketResponse> getPublicMarkets() {
        return markets.findAll().stream()
            .filter(Market::isActive)
            .map(market -> MarketResponse.from(
                market,
                stalls.findAllByMarketIdOrderByCode(market.getId()).stream()
                    .filter(stall -> accounts.findByStallId(stall.getId()).isEmpty())
                    .map(mz.beira.cobranca.dto.StallResponse::from)
                    .toList(),
                0
            ))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<MarketResponse> getAdminMarkets() {
        return markets.findAll().stream()
            .map(market -> MarketResponse.from(
                market,
                stalls.findAllByMarketIdOrderByCode(market.getId()).stream()
                    .map(stall -> accounts.findByStallId(stall.getId())
                        .map(account -> mz.beira.cobranca.dto.StallResponse.from(
                            stall, account.getName(), account.getProduct()))
                        .orElseGet(() -> mz.beira.cobranca.dto.StallResponse.from(stall, null, null)))
                    .toList(),
                accounts.countByMarketIdAndRole(market.getId(), "MERCHANT")
            ))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<RateResponse> getRates(Long marketId) {
        return rates.findAllByMarketIdAndActiveTrueOrderByProduct(marketId).stream()
            .map(rate -> RateResponse.from(
                rate,
                accounts.countByMarketIdAndProductIgnoreCaseAndRole(
                    marketId, rate.getProduct(), "MERCHANT")
            ))
            .toList();
    }
}
