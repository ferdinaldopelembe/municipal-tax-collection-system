package mz.beira.cobranca.models;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;

@Entity
@Table(name = "rates", uniqueConstraints = @UniqueConstraint(columnNames = {"market_id", "product"}))
public class Rate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id", nullable = false)
    private Market market;
    private String product;
    private String periodicity;
    private BigDecimal amount;
    private boolean active;
    private String description;

    protected Rate() {}

    public Rate(Market market, String product, String periodicity, BigDecimal amount, boolean active) {
        this.market = market;
        this.product = product;
        this.periodicity = periodicity;
        this.amount = amount;
        this.active = active;
    }

    public Long getId() { return id; }
    public Market getMarket() { return market; }
    public String getProduct() { return product; }
    public String getPeriodicity() { return periodicity; }
    public BigDecimal getAmount() { return amount; }
    public boolean isActive() { return active; }
    public String getDescription() { return description; }

    public void update(Market market, String product, String periodicity, BigDecimal amount,
                       boolean active, String description) {
        this.market = market;
        this.product = product;
        this.periodicity = periodicity;
        this.amount = amount;
        this.active = active;
        this.description = description;
    }
}
