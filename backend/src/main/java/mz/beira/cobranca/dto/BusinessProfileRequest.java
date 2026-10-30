package mz.beira.cobranca.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BusinessProfileRequest(
    @NotNull Long marketId,
    @NotNull Long stallId,
    @NotBlank String product
) {}
