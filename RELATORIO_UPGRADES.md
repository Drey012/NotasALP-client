# Relatório de evolução — NotasALP Client

## Estado atual

O cliente foi separado da API no repositório `Drey012/NotasALP-client` e consome a branch `feature/spring-boot-rest-api` do back-end por HTTP. A API existente já fornece `GET /api/notas/professores` e `POST /api/notas/avaliar`, portanto nenhuma configuração de back-end foi adicionada ou necessária nesta entrega.

## Back-end

| Prioridade | Sugestão | Benefício |
|---|---|---|
| P0 | Adicionar CORS configurável para a origem da Vercel | Permite chamadas browser-to-API em produção com segurança |
| P0 | Criar testes de contrato para os dois endpoints | Evita quebrar o cliente ao alterar DTOs |
| P0 | Corrigir o typo `Algotitmo` no nome da matéria | Evita exibição incorreta no seletor |
| P1 | Padronizar erros em JSON | Permite mensagens melhores no cliente |
| P1 | Validar notas entre 0 e 10 no servidor | Garante integridade independentemente do navegador |
| P1 | Adicionar OpenAPI/Swagger | Facilita integração e manutenção |
| P2 | Versionar regras de avaliação | Permite auditar mudanças de pesos e limiares |
| P2 | Separar configurações de produção e desenvolvimento | Reduz risco de CORS e URLs incorretas |

A decisão mais importante é documentar formalmente a regra de P3. As estratégias atuais usam a comparação entre P1 e P2 para decidir qual nota é substituída pela P3; esse comportamento deve ser confirmado pelo regulamento acadêmico e coberto por testes.

## Front-end

| Prioridade | Sugestão | Benefício |
|---|---|---|
| P0 | Adicionar proxy/rewrite ou CORS configurado no back-end | Simplifica o deploy e reduz falhas cross-origin |
| P0 | Criar testes de integração com Mock Service Worker | Valida loading, erro, P3, exame e sucesso |
| P1 | Extrair componentes da página principal | Melhora manutenibilidade e permite evolução paralela |
| P1 | Adicionar histórico de simulações | Torna o cliente útil durante todo o semestre |
| P1 | Melhorar acessibilidade com live regions | Faz o resultado ser anunciado por leitores de tela |
| P2 | Adicionar PWA e cache do catálogo de professores | Permite uso em redes instáveis |
| P2 | Adicionar monitoramento de erros | Facilita diagnóstico em produção |

## Deploy

Na Vercel, importe `Drey012/NotasALP-client` como um projeto Next.js na raiz do repositório. Configure `NEXT_PUBLIC_API_URL` com a URL pública da API Spring Boot. O cliente já usa os endpoints reais e não adiciona arquivos ao repositório do back-end.
