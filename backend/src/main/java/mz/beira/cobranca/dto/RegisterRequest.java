package mz.beira.cobranca.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank String name,
    @Email String email,
    String phone,
    @NotBlank @Size(min = 6) String password,
    @NotNull Long marketId,
    @NotNull Long stallId,
    @NotBlank String product,
    String nuit
) {}
