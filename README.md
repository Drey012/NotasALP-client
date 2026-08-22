# NotasALP Client

Cliente web em Next.js para a API REST do repositório [`Drey012/NotasALP`](https://github.com/Drey012/NotasALP), branch `feature/spring-boot-rest-api`.

## Stack

Next.js 15, React 19, TypeScript e CSS responsivo com uma direção editorial em marfim, azul profundo, coral e verde. O cliente não replica as regras de negócio: ele carrega os professores em `GET /api/notas/professores` e envia as notas para `POST /api/notas/avaliar`.

## Executar localmente

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

A aplicação abre em `http://localhost:3000`. A API deve estar disponível em `http://localhost:8080`.

## Variáveis de ambiente

`NEXT_PUBLIC_API_URL` define a URL base do back-end. Para produção, configure-a no painel da Vercel, por exemplo `https://sua-api.exemplo.com`.

## Validar e publicar

```bash
pnpm typecheck
pnpm build
```

Na Vercel, importe `Drey012/NotasALP-client`, selecione Next.js e mantenha a raiz do projeto como diretório de publicação. Não é necessário adicionar nenhuma pasta ou arquivo deste repositório ao back-end.

## Contrato consumido

A tela usa o retorno real da API:

- `GET /api/notas/professores`: lista `indice`, `nomeProfessor`, `nomeMateria` e `rotulosNotasIniciais`.
- `POST /api/notas/avaliar`: recebe `indiceProfessor`, `notasIniciais`, e opcionalmente `p3` e `exame`.
- A resposta usa `notaAtual`, `status`, `precisaP3` e `precisaExame`.

O fluxo é progressivo: P3 e exame só aparecem quando a resposta da API sinaliza que são necessários. Erros de conexão, dados incompletos e estado de carregamento são exibidos na interface.
