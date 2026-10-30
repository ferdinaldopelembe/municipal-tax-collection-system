package mz.beira.cobranca.controllers;

import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import mz.beira.cobranca.dto.PaymentRequest;
import mz.beira.cobranca.dto.PaymentResponse;
import mz.beira.cobranca.models.Account;
import mz.beira.cobranca.services.SessionAccountService;
import mz.beira.cobranca.services.PaymentService;
import mz.beira.cobranca.services.AdminService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService payments;
    private final SessionAccountService sessionAccounts;
    private final AdminService admin;

    public PaymentController(
        PaymentService payments,
        SessionAccountService sessionAccounts,
        AdminService admin
    ) {
        this.payments = payments;
        this.sessionAccounts = sessionAccounts;
        this.admin = admin;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<PaymentResponse> list(HttpSession session) {
        Account account = sessionAccounts.getAccount(session);
        return payments.getPayments(account);
    }

    @PostMapping
    @Transactional
    public PaymentResponse create(
        @Valid @RequestBody PaymentRequest request,
        HttpSession session,
        HttpServletRequest servletRequest
    ) {
        Account account = sessionAccounts.getAccount(session);
        PaymentResponse response = payments.makePayment(account, request);
        admin.audit(
            account, "Cobrança", "Pagamento",
            "Registou o pagamento " + response.paymentReference() + ".", servletRequest.getRemoteAddr()
        );
        return response;
    }
}
