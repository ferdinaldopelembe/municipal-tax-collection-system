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

@Entity
@Table(name = "stalls", uniqueConstraints = @UniqueConstraint(columnNames = {"market_id", "code"}))
public class Stall {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String code;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id", nullable = false)
    private Market market;

    protected Stall() {}

    public Stall(String code, Market market) {
        this.code = code;
        this.market = market;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public Market getMarket() { return market; }
}
