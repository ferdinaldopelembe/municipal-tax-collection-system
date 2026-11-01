# Cobrança de Mercados

Aplicação web para gestão de mercados, comerciantes e pagamentos, com frontend React/Vite e API Spring Boot. O backend usa H2 em ficheiro para manter os dados entre reinícios.

## Requisitos

- JDK 17 ou superior (o projeto compila para Java 17)
- Node.js e npm

## Executar localmente

Na primeira inicialização, configure a conta administrativa no PowerShell. A palavra-passe deve ter pelo menos 12 caracteres:

```powershell
$env:COBRANCA_ADMIN_EMAIL = "admin@beira.gov.mz"
$env:COBRANCA_ADMIN_PASSWORD = "defina-uma-palavra-passe-forte"
cd backend
.\mvnw.cmd spring-boot:run
```

No CMD, defina as variáveis e inicie o backend na mesma janela:

```cmd
set "COBRANCA_ADMIN_EMAIL=admin@beira.gov.mz"
set "COBRANCA_ADMIN_PASSWORD=defina-uma-palavra-passe-forte"
cd backend
mvnw.cmd spring-boot:run
```

Se o backend já tiver terminado com erro por falta de palavra-passe, defina as variáveis e execute novamente `mvnw.cmd spring-boot:run`. Aguarde a mensagem `Started CobrancaApplication` antes de abrir o frontend. A mensagem de sucesso no arranque é importante: sem ela, o login não consegue chegar à API.

Inicie o frontend num segundo terminal:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Abra `http://localhost:5173`. Comerciantes podem criar a própria conta no ecrã de registo; o administrador usa o e-mail e a palavra-passe configurados acima. A conta administrativa é criada apenas se ainda não existir; alterar as variáveis de ambiente depois não altera o e-mail ou a palavra-passe de uma conta já criada.

## Persistência e configuração

- A base de dados H2 fica em `backend/data/cobranca.mv.db` (o caminho `data/` é relativo à pasta `backend`, de onde a API é iniciada nos comandos acima). O ficheiro é ignorado pelo Git para manter os dados locais fora do repositório. Pare a API antes de copiar esse ficheiro para uma cópia de segurança.
- A aplicação inicializa exemplos de mercados, bancas e taxas. Confirme e substitua estes dados pelos dados oficiais antes de utilização operacional.
- `COBRANCA_CORS_ORIGINS` define as origens permitidas, separadas por vírgulas. O valor local por omissão permite Vite em `localhost:5173` e `127.0.0.1:5173`.
- Em HTTPS, defina `COBRANCA_COOKIE_SECURE=true`. Não exponha a API nem o H2 a redes públicas sem HTTPS, cópias de segurança e uma configuração de produção adequada.
- H2 em ficheiro destina-se a uma instalação de instância única; não é uma configuração de alta disponibilidade nem adequada a várias instâncias concorrentes.

## Limites funcionais importantes

Os pagamentos em numerário são persistidos pela API e os recibos podem ser impressos. Métodos electrónicos (M-Pesa, e-Mola, Mkesh e POS) estão desactivados até existir uma integração que confirme a liquidação; a API também rejeita esses métodos. Notificações por e-mail/SMS e 2FA não estão configuradas.

## Validação

```powershell
cd frontend
npm.cmd run lint
npm.cmd run build
cd ..\backend
.\mvnw.cmd clean test
```
