package mz.beira.cobranca.models;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String paymentReference;
    @Column(unique = true, nullable = false)
    private String transactionReference;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id", nullable = false)
    private Market market;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stall_id", nullable = false)
    private Stall stall;
    private String product;
    private String periodicity;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private BigDecimal amount;
    @Column(name = "payment_method")
    private String method;
    private String status;
    private LocalDateTime paidAt;

    protected Payment() {}

    public Payment(String paymentReference, String transactionReference, Account account, Market market,
                   Stall stall, String product, String periodicity, LocalDate periodStart,
                   LocalDate periodEnd, BigDecimal amount, String method, LocalDateTime paidAt) {
        this.paymentReference = paymentReference;
        this.transactionReference = transactionReference;
        this.account = account;
        this.market = market;
        this.stall = stall;
        this.product = product;
        this.periodicity = periodicity;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
        this.amount = amount;
        this.method = method;
        this.status = "Pago";
        this.paidAt = paidAt;
    }

    public Long getId() { return id; }
    public String getPaymentReference() { return paymentReference; }
    public String getTransactionReference() { return transactionReference; }
    public Account getAccount() { return account; }
    public Market getMarket() { return market; }
    public Stall getStall() { return stall; }
    public String getProduct() { return product; }
    public String getPeriodicity() { return periodicity; }
    public LocalDate getPeriodStart() { return periodStart; }
    public LocalDate getPeriodEnd() { return periodEnd; }
    public BigDecimal getAmount() { return amount; }
    public String getMethod() { return method; }
    public String getStatus() { return status; }
    public LocalDateTime getPaidAt() { return paidAt; }
}
