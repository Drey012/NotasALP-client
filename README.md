# NotasALP Client

Cliente web em Next.js para a API REST do repositório [`Drey012/NotasALP`](https://github.com/Drey012/NotasALP). A interface mantém a consulta acadêmica pública e protege o gerenciamento administrativo com autenticação JWT.

## Fluxo de autenticação

A área **Consultar dados** continua disponível sem login, pois o backend permite as rotas públicas de consulta e avaliação. A área **Área administrativa** abre a tela de autenticação quando não existe uma sessão local válida. Usuários `CONSULTOR` autenticados não podem acessar o CRUD; somente `ADMIN` possui essa permissão.

A tela de acesso possui dois fluxos:

- **Registro:** envia `POST /api/auth/registrar` com `nome`, `email` e `senha` de pelo menos seis caracteres. O backend mantém o cadastro público desativado por padrão. Quando habilitado apenas para demonstração, o usuário recebe o papel `CONSULTOR`, nunca `ADMIN`.
- **Login:** envia `POST /api/auth/login` com `email` e `senha`.

Os endpoints retornam apenas `email`, `nome` e `cargo`; o JWT é emitido pelo backend em cookie `HttpOnly`, `SameSite=Lax` e configurável como `Secure`. O frontend mantém somente os dados visuais da sessão em `sessionStorage`, sem armazenar o token.

## Sessão e autorização

`lib/api.ts` envia requisições com `credentials: include`, lê o cookie CSRF não sensível e envia `X-XSRF-TOKEN` nas mutações. O JWT nunca é lido pelo JavaScript. O backend aplica o cookie de sessão nas operações administrativas.

Quando uma requisição protegida retorna `401`, o cliente remove a sessão, notifica o shell da aplicação e retorna o usuário à aba pública de consulta com a mensagem **“Sessão expirada. Faça login novamente.”** O logout manual chama `POST /api/auth/logout` para expirar o cookie e remove os dados visuais da sessão do navegador.

A sessão é válida por até oito horas e é armazenada em cookie HttpOnly. A flag `Secure` deve ser ativada em HTTPS via `AUTH_COOKIE_SECURE=true`. A validade do JWT permanece responsabilidade do filtro JWT e do Spring Security.

## Contratos consumidos

| Área                | Método                         | Endpoint                                                    |
| ------------------- | ------------------------------ | ----------------------------------------------------------- |
| Registro            | `POST`                         | `/api/auth/registrar`                                       |
| Login               | `POST`                         | `/api/auth/login`                                           |
| Consulta de notas   | `GET` / `POST`                 | `/api/professores`, `/api/avaliar`                          |
| CRUD administrativo | `GET`, `POST`, `PUT`, `DELETE` | `/api/cursos`, `/api/admin/cursos`, e recursos equivalentes |

As operações administrativas continuam organizadas em `components/CreationTab.tsx`, com suporte a criação, edição, exclusão e feedbacks detalhados.

## Tratamento de erros

O cliente interpreta o contrato padronizado do backend através de `ApiError`, preservando `status`, `mensagem` e a lista `detalhes` de validação. A tela de autenticação exibe os detalhes retornados para erros `400`, como e-mail inválido, nome ausente ou senha curta, além de mensagens de regra de negócio como **“O e-mail informado já está em uso.”** e **“Credenciais inválidas.”**

Os demais erros são apresentados de acordo com o status: `401` encerra a sessão, `404` indica recurso não encontrado, `409` informa conflito de integridade e `500` exibe o erro interno retornado pelo servidor.

## Arquitetura

| Arquivo                          | Responsabilidade                                                   |
| -------------------------------- | ------------------------------------------------------------------ |
| `app/page.tsx`                   | Shell, navegação pública/administrativa e ciclo de vida da sessão. |
| `components/AuthScreen.tsx`      | Login, registro e feedback de autenticação.                        |
| `components/ConsultationTab.tsx` | Consulta pública de atribuições e avaliação de notas.              |
| `components/CreationTab.tsx`     | CRUD administrativo protegido.                                     |
| `components/ui.tsx`              | Campos, métricas e feedbacks reutilizáveis.                        |
| `lib/api.ts`                     | Tipos, autenticação JWT, sessão local e chamadas HTTP.             |

## Executar localmente

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

A aplicação abre em `http://localhost:3000`. Por padrão, o cliente procura a API em `http://localhost:8080`.

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Validar

```bash
pnpm typecheck
pnpm build
```

O frontend espera o backend na versão equivalente à branch `feature/Auth`, com `/api/auth/**`, Spring Security, JWT e os contratos CRUD protegidos. Nenhum arquivo ou alteração foi feito no repositório `NotasALP` durante esta implementação.
