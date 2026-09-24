# NotasALP Client

Cliente web em Next.js para a API REST do repositório [`Drey012/NotasALP`](https://github.com/Drey012/NotasALP). A interface mantém a consulta acadêmica pública e protege o gerenciamento administrativo com autenticação JWT.

## Fluxo de autenticação

A área **Consultar dados** continua disponível sem login, pois o backend permite as rotas públicas de consulta e avaliação. A área **Área administrativa** abre a tela de autenticação quando não existe uma sessão local válida.

A tela de acesso possui dois fluxos:

- **Registro:** envia `POST /api/auth/registrar` com `nome`, `email` e `senha` de pelo menos seis caracteres. O backend cria o administrador e retorna o token JWT.
- **Login:** envia `POST /api/auth/login` com `email` e `senha`.

Ambos os endpoints retornam `token`, `tipo`, `email` e `nome`. Após sucesso, a sessão é salva no `localStorage` sob a chave `notasalp.auth.session` e o usuário entra diretamente na área administrativa.

## Sessão e autorização

`lib/api.ts` injeta automaticamente `Authorization: Bearer <token>` nas requisições quando existe uma sessão. Isso permite que as operações administrativas de CRUD funcionem sem que cada componente precise lidar diretamente com o cabeçalho.

Quando uma requisição protegida retorna `401`, o cliente remove a sessão, notifica o shell da aplicação e retorna o usuário à aba pública de consulta com a mensagem **“Sessão expirada. Faça login novamente.”** O logout manual remove o token e os dados da sessão do navegador.

A sessão é armazenada apenas no navegador atual. O frontend não tenta interpretar o conteúdo do JWT; a validade do token permanece responsabilidade do filtro JWT e do Spring Security.

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
