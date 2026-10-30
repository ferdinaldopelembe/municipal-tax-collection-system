package mz.beira.cobranca;

import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import mz.beira.cobranca.models.Market;
import mz.beira.cobranca.models.Stall;
import mz.beira.cobranca.repositories.AccountRepository;
import mz.beira.cobranca.repositories.MarketRepository;
import mz.beira.cobranca.repositories.StallRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
class PaymentApiTests {
    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private MarketRepository markets;
    @Autowired private StallRepository stalls;
    @Autowired private AccountRepository accounts;

    @Test
    void merchantPaymentsArePrivateAndServerCalculatesReferencesAndAmount() throws Exception {
        Market market = markets.findByName("Mercado do Maquinino").orElseThrow();
        Stall firstStall = availableStall(market);
        MockHttpSession firstSession = register(market, firstStall, "first");

        mvc.perform(post("/api/payments")
                .session(firstSession)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"method\":\"Numerário\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.amount").value(50))
            .andExpect(jsonPath("$.paymentReference", matchesPattern("PAG-\\d{4}-[A-F0-9]{10}")))
            .andExpect(jsonPath("$.transactionReference", matchesPattern("TRX-\\d{4}-[A-F0-9]{10}")))
            .andExpect(jsonPath("$.stall").value(firstStall.getCode()));

        Stall secondStall = availableStall(market);
        MockHttpSession secondSession = register(market, secondStall, "second");
        mvc.perform(post("/api/payments")
                .session(secondSession)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"method\":\"M-Pesa\"}"))
            .andExpect(status().isOk());

        mvc.perform(get("/api/payments").session(firstSession))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].stall").value(firstStall.getCode()));

        MvcResult adminLogin = mvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"admin@beira.gov.mz\",\"password\":\"admin123\"}"))
            .andExpect(status().isOk())
            .andReturn();
        MockHttpSession adminSession =
            (MockHttpSession) adminLogin.getRequest().getSession(false);
        mvc.perform(get("/api/payments").session(adminSession))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2));
    }

    private MockHttpSession register(Market market, Stall stall, String prefix) throws Exception {
        String unique = prefix + "-" + UUID.randomUUID();
        String request = objectMapper.writeValueAsString(new RegisterPayload(
            "Comerciante " + prefix,
            unique + "@example.test",
            "+258 84 " + Math.abs(unique.hashCode() % 1_000_000_000),
            "password123",
            market.getId(),
            stall.getId(),
            "Peixe"
        ));
        MvcResult result = mvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(request))
            .andExpect(status().isOk())
            .andReturn();
        return (MockHttpSession) result.getRequest().getSession(false);
    }

    private Stall availableStall(Market market) {
        return stalls.findAllByMarketIdOrderByCode(market.getId()).stream()
            .filter(stall -> accounts.findByStallId(stall.getId()).isEmpty())
            .findFirst()
            .orElseThrow();
    }

    private record RegisterPayload(
        String name,
        String email,
        String phone,
        String password,
        Long marketId,
        Long stallId,
        String product
    ) {}
}
