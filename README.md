# NotasALP Client

Cliente web em Next.js para a API REST do repositório [`Drey012/NotasALP`](https://github.com/Drey012/NotasALP). Esta versão organiza o produto em duas áreas principais: **Consulta** e **Cadastro**.

## Arquitetura

A página principal atua somente como shell de navegação. As responsabilidades foram separadas em componentes e serviços:

| Arquivo                          | Responsabilidade                                                      |
| -------------------------------- | --------------------------------------------------------------------- |
| `app/page.tsx`                   | Shell visual, navegação entre as áreas e métricas gerais.             |
| `components/ConsultationTab.tsx` | Consulta de atribuições, avaliação de notas e leitura dos resultados. |
| `components/CreationTab.tsx`     | Formulários administrativos para toda a estrutura acadêmica.          |
| `components/ui.tsx`              | Campos, métricas e mensagens reutilizáveis.                           |
| `lib/api.ts`                     | Tipos TypeScript e chamadas HTTP para o backend.                      |
| `app/globals.css`                | Identidade visual, layout responsivo e estados dos componentes.       |

A lógica de cálculo não é duplicada no cliente: a avaliação é sempre delegada ao motor de regras da API.

## Abas e contratos consumidos

### Consulta

A aba **Consultar dados** carrega as atribuições para o formulário de notas com `GET /api/professores` e envia os dados preenchidos para `POST /api/avaliar`. Os campos de P3 e exame aparecem progressivamente conforme `precisaP3` e `precisaExame` na resposta.

Também existe um catálogo de atribuições, carregado com `GET /api/atribuicoes`, para consulta rápida de professor, matéria e turno.

### Cadastro

A aba **Criar registros** contém um formulário por tipo de entidade e respeita a ordem recomendada pelo backend:

1. Curso — `POST /api/admin/cursos`
2. Professor — `POST /api/admin/professores`
3. Semestre — `POST /api/admin/semestres`
4. Matéria — `POST /api/admin/materias`
5. Atribuição — `POST /api/admin/atribuicoes`

Os registros auxiliares são consultados para preencher os relacionamentos dos formulários:

- `GET /api/cursos`
- `GET /api/professores-cadastrados`
- `GET /api/semestres`
- `GET /api/materias`
- `GET /api/atribuicoes`

A atribuição valida o campo `jsonFormula` antes do envio para evitar cadastrar JSON inválido no backend.

## Executar localmente

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

A aplicação abre em `http://localhost:3000`. Por padrão, o cliente procura a API em `http://localhost:8080`.

## Variáveis de ambiente

`NEXT_PUBLIC_API_URL` define a URL base do backend:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Validar

```bash
pnpm typecheck
pnpm build
```

O cliente espera que o backend esteja executando a branch `feature/Add-Data` ou outra versão que exponha os mesmos contratos. Nenhum arquivo ou alteração foi feito no repositório do backend durante esta remodelação.
