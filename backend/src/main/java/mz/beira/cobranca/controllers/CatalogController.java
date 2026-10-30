package mz.beira.cobranca.controllers;

import java.util.List;
import mz.beira.cobranca.dto.MarketResponse;
import mz.beira.cobranca.dto.RateResponse;
import mz.beira.cobranca.services.CatalogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalog")
public class CatalogController {
    private final CatalogService catalog;

    public CatalogController(CatalogService catalog) {
        this.catalog = catalog;
    }

    @GetMapping("/markets")
    public List<MarketResponse> markets() {
        return catalog.getMarkets();
    }

    @GetMapping("/rates")
    public List<RateResponse> rates(@RequestParam Long marketId) {
        return catalog.getRates(marketId);
    }
}
