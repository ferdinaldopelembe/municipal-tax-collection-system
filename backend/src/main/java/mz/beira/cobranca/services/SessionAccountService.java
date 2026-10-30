package mz.beira.cobranca.services;

import jakarta.servlet.http.HttpSession;
import mz.beira.cobranca.models.Account;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SessionAccountService {
    public static final String ACCOUNT_SESSION_KEY = "accountId";
    private final AccountService accounts;

    public SessionAccountService(AccountService accounts) {
        this.accounts = accounts;
    }

    public Account getAccount(HttpSession session) {
        Object accountId = session.getAttribute(ACCOUNT_SESSION_KEY);
        if (!(accountId instanceof Long id)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Inicie sessão para continuar.");
        }
        return accounts.findById(id);
    }
}
