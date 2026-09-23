# NotasALP Client

Cliente web em Next.js para a API REST do repositório [`Drey012/NotasALP`](https://github.com/Drey012/NotasALP). A interface organiza o sistema em duas áreas: **Consultar dados** e **Criar registros**.

## Arquitetura

A página principal funciona como shell de navegação. As responsabilidades estão separadas entre componentes visuais e o serviço HTTP:

| Arquivo                          | Responsabilidade                                                              |
| -------------------------------- | ----------------------------------------------------------------------------- |
| `app/page.tsx`                   | Shell visual, navegação entre consulta e administração.                       |
| `components/ConsultationTab.tsx` | Consulta de atribuições, avaliação de notas e leitura de resultados.          |
| `components/CreationTab.tsx`     | Listagem, criação, atualização e exclusão dos cinco recursos administrativos. |
| `components/ui.tsx`              | Campos, métricas e feedbacks reutilizáveis.                                   |
| `lib/api.ts`                     | Tipos TypeScript, chamadas HTTP CRUD e `ApiError`.                            |
| `app/globals.css`                | Identidade visual, layout responsivo e estados dos componentes.               |

As regras de avaliação continuam centralizadas no backend. O cliente apenas coleta as notas, chama a API e apresenta o resultado.

## Operações administrativas

Cada seção da aba **Criar registros** possui formulário de criação e uma lista dos registros existentes com ações de edição e exclusão. Exclusões exigem confirmação local antes do envio e, quando retornam `204 No Content`, a lista é atualizada automaticamente.

| Recurso     | Listagem                           | Criação                       | Atualização                       | Exclusão                             |
| ----------- | ---------------------------------- | ----------------------------- | --------------------------------- | ------------------------------------ |
| Cursos      | `GET /api/cursos`                  | `POST /api/admin/cursos`      | `PUT /api/admin/cursos/{id}`      | `DELETE /api/admin/cursos/{id}`      |
| Professores | `GET /api/professores-cadastrados` | `POST /api/admin/professores` | `PUT /api/admin/professores/{id}` | `DELETE /api/admin/professores/{id}` |
| Semestres   | `GET /api/semestres`               | `POST /api/admin/semestres`   | `PUT /api/admin/semestres/{id}`   | `DELETE /api/admin/semestres/{id}`   |
| Matérias    | `GET /api/materias`                | `POST /api/admin/materias`    | `PUT /api/admin/materias/{id}`    | `DELETE /api/admin/materias/{id}`    |
| Atribuições | `GET /api/atribuicoes`             | `POST /api/admin/atribuicoes` | `PUT /api/admin/atribuicoes/{id}` | `DELETE /api/admin/atribuicoes/{id}` |

A ordem recomendada para criação é **cursos → professores → semestres → matérias → atribuições**, respeitando as relações entre os dados. Durante edições, os IDs relacionados são selecionados novamente quando o Response DTO fornece apenas os nomes relacionados.

## Tratamento de erros

O wrapper de `lib/api.ts` interpreta o contrato `ErroRespostaDTO` do backend e lança `ApiError` com:

- `status`: código HTTP retornado;
- `message`: campo `mensagem` da API;
- `details`: lista `detalhes` das falhas de validação.

A interface apresenta mensagens contextualizadas para os principais cenários:

| Status | Apresentação no frontend                                        |
| ------ | --------------------------------------------------------------- |
| `400`  | “Dados inválidos” e, quando disponíveis, os detalhes por campo. |
| `404`  | “Não encontrado” com a mensagem enviada pelo backend.           |
| `409`  | “Conflito”, especialmente para exclusões com dados vinculados.  |
| `500`  | “Erro do servidor” com a orientação retornada pela API.         |

Falhas locais de JSON na fórmula de uma atribuição também são detectadas antes do envio.

## Consulta acadêmica

A aba **Consultar dados** carrega as opções com `GET /api/professores`, envia notas para `POST /api/avaliar` e exibe P3 ou exame final apenas quando a resposta indicar `precisaP3` ou `precisaExame`. O catálogo de atribuições usa `GET /api/atribuicoes`.

## Executar localmente

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

A aplicação abre em `http://localhost:3000`. Por padrão, o cliente procura a API em `http://localhost:8080`.

## Variáveis de ambiente

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Validar

```bash
pnpm typecheck
pnpm build
```

O cliente espera que o backend esteja executando uma versão com os contratos CRUD e `GlobalExceptionHandler` descritos no README mais recente da branch `feature/Add-Data`. Nenhum arquivo ou alteração é feito no repositório do backend por este projeto.
