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
@Table(name = "fiscals", uniqueConstraints = {
    @UniqueConstraint(columnNames = "nuit"),
    @UniqueConstraint(columnNames = "email")
})
public class Fiscal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String nuit;
    private String phone;
    private String email;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id", nullable = false)
    private Market market;
    private String zone;
    private String shift;
    private boolean active = true;
    private String statusReason;

    protected Fiscal() {}

    public Fiscal(String name, String nuit, String phone, String email, Market market,
                  String zone, String shift) {
        this.name = name;
        this.nuit = nuit;
        this.phone = phone;
        this.email = email;
        this.market = market;
        this.zone = zone;
        this.shift = shift;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getNuit() { return nuit; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public Market getMarket() { return market; }
    public String getZone() { return zone; }
    public String getShift() { return shift; }
    public boolean isActive() { return active; }
    public String getStatusReason() { return statusReason; }

    public void update(String name, String nuit, String phone, String email, Market market,
                       String zone, String shift) {
        this.name = name;
        this.nuit = nuit;
        this.phone = phone;
        this.email = email;
        this.market = market;
        this.zone = zone;
        this.shift = shift;
    }

    public void setActive(boolean active, String reason) {
        this.active = active;
        this.statusReason = reason;
    }
}
