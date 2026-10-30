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
import java.util.Locale;

@Entity
@Table(name = "accounts", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email"),
    @UniqueConstraint(columnNames = "phone"),
    @UniqueConstraint(columnNames = "stall_id")
})
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String passwordHash;
    private String role;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id")
    private Market market;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stall_id")
    private Stall stall;
    private String product;

    protected Account() {}

    public Account(String name, String email, String phone, String passwordHash, String role,
                   Market market, Stall stall, String product) {
        this.name = name;
        this.email = email == null || email.isBlank() ? null : email.trim().toLowerCase(Locale.ROOT);
        this.phone = phone == null || phone.isBlank() ? null : phone.trim();
        this.passwordHash = passwordHash;
        this.role = role;
        this.market = market;
        this.stall = stall;
        this.product = product;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getPasswordHash() { return passwordHash; }
    public String getRole() { return role; }
    public Market getMarket() { return market; }
    public Stall getStall() { return stall; }
    public String getProduct() { return product; }

    public void associateBusiness(Market market, Stall stall, String product) {
        this.market = market;
        this.stall = stall;
        this.product = product;
    }
}
