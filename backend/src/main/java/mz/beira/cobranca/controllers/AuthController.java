package mz.beira.cobranca.controllers;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import mz.beira.cobranca.dto.AccountResponse;
import mz.beira.cobranca.dto.BusinessProfileRequest;
import mz.beira.cobranca.dto.LoginRequest;
import mz.beira.cobranca.dto.RegisterRequest;
import mz.beira.cobranca.models.Account;
import mz.beira.cobranca.services.AccountService;
import mz.beira.cobranca.services.SessionAccountService;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AccountService accounts;
    private final SessionAccountService sessionAccounts;

    public AuthController(AccountService accounts, SessionAccountService sessionAccounts) {
        this.accounts = accounts;
        this.sessionAccounts = sessionAccounts;
    }

    @PostMapping("/register")
    @Transactional
    public AccountResponse register(@Valid @RequestBody RegisterRequest request, HttpSession session) {
        Account account = accounts.register(request);
        session.setAttribute(SessionAccountService.ACCOUNT_SESSION_KEY, account.getId());
        return AccountResponse.from(account);
    }

    @PostMapping("/login")
    @Transactional(readOnly = true)
    public AccountResponse login(@Valid @RequestBody LoginRequest request, HttpSession session) {
        Account account = accounts.authenticate(request);
        session.setAttribute(SessionAccountService.ACCOUNT_SESSION_KEY, account.getId());
        return AccountResponse.from(account);
    }

    @GetMapping("/me")
    @Transactional(readOnly = true)
    public AccountResponse me(HttpSession session) {
        return AccountResponse.from(sessionAccounts.getAccount(session));
    }

    @PutMapping("/profile")
    @Transactional
    public AccountResponse updateProfile(
        @Valid @RequestBody BusinessProfileRequest request,
        HttpSession session
    ) {
        Account account = sessionAccounts.getAccount(session);
        if (!"MERCHANT".equals(account.getRole())) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "Este perfil não pode ser alterado.");
        }
        return AccountResponse.from(accounts.updateBusinessProfile(account, request));
    }

    @PostMapping("/logout")
    public void logout(HttpSession session) {
        session.invalidate();
    }

}
