package mz.beira.cobranca.dto;

import mz.beira.cobranca.models.Account;

public record AccountResponse(
    Long id,
    String name,
    String email,
    String phone,
    String role,
    Long marketId,
    String market,
    Long stallId,
    String stall,
    String product,
    String nuit,
    String status,
    String statusReason
) {
    public static AccountResponse from(Account account) {
        return new AccountResponse(
            account.getId(),
            account.getName(),
            account.getEmail(),
            account.getPhone(),
            account.getRole(),
            account.getMarket() == null ? null : account.getMarket().getId(),
            account.getMarket() == null ? null : account.getMarket().getName(),
            account.getStall() == null ? null : account.getStall().getId(),
            account.getStall() == null ? null : account.getStall().getCode(),
            account.getProduct(),
            account.getNuit(),
            account.getStatus(),
            account.getStatusReason()
        );
    }
}
