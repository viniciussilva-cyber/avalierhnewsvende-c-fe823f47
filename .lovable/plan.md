# RH NEWS VENDE-C — Plano de Implementação

Plataforma de leitura e avaliação de newsletters internas, com tema dark, integração Firebase/Firestore, tela pública para colaboradores e painel protegido para moderadores.

## Pré-requisito: configuração do Firebase
Para conectar ao seu Firestore, vou precisar das chaves de configuração web do seu projeto Firebase (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`). Essas chaves são publicáveis e ficam no código com segurança — a proteção real virá das **Regras do Firestore**. Você poderá colar essa config quando começarmos a build.

## Design System (Dark Mode)
- Tipografia: **Inter** (via `@fontsource/inter`).
- Tokens de cor (em `src/styles.css`, sem cores hardcoded nos componentes):
  - `--background` → `#0a0a0a`
  - `--card` / seções internas → `#111111`
  - `--header` → `#050505`
  - `--accent` (Vende-C) → `#FF0055`
  - Textos: branco puro, `#e5e5e5` (títulos), `#9ca3af` / `#6b7280` (secundários)
- Tipografia `prose` adaptada para dark mode no conteúdo da newsletter.

## Estrutura de dados (Firestore)
- Coleção `newsletters`: `id` (slug, ex. `julho-2026`), `title`, `monthYear`, `content` (HTML string), `status` (`draft` | `published`), `createdAt`.
- Coleção `evaluations`: `newsletterId`, `rating` (0–10), `name`, `role`, `comment` (opcional), `date`.

## Rotas (TanStack Router)
- `/` — Tela pública (lê `?edition=slug`).
- `/admin` — Login do moderador.
- `/admin/dashboard` — Painel (protegido por estado de login).

## 1. Tela Pública (Colaborador) — `/`
- Lê `?edition=slug`; sem parâmetro, carrega a edição `published` mais recente.
- **Header:** ícone de jornal (Lucide `Newspaper`), título "RH News", subtítulo "Newsletter interno".
- **Hero:** imagem de fundo `vende-c.jpg` (você fornecerá) + overlay `bg-black/50` e gradiente para baixo. Exibe: tag mês/ano, título da edição, **Nota Média Geral** (média das `evaluations` da edição) e botão "Ler e avaliar".
- **Botão "Ler e avaliar":** faz *smooth scroll* até o formulário de avaliação.
- **Formulário de Avaliação** (posicionado ANTES do conteúdo):
  - "De 0 a 10, que nota você dá?" (seletor de nota).
  - Nome Completo (obrigatório), Cargo (obrigatório), Comentário/melhorias (textarea opcional).
  - Validação com Zod; ao enviar grava em `evaluations` e exibe mensagem de agradecimento.
- **Conteúdo da Newsletter:** renderiza o HTML rico com `prose` dark.
- **Outras Edições (footer):** grid das edições `published` anteriores; clicar atualiza `?edition=...` e recarrega a visualização.

## 2. Login do Moderador — `/admin`
- Fundo `#111`, layout simples.
- Acesso hardcoded: e-mails `vinicius.silva@vende-c.com` e `lucas.izan@vende-c.com`, senha única `rh2026!`.
- Input de senha com mostrar/ocultar (ícone Lucide `Eye` / `EyeOff`). Sem redefinição de senha.
- Sessão mantida em estado local (sessionStorage) para acesso ao dashboard.

## 3. Painel do Moderador — `/admin/dashboard`
Hero idêntica à pública + menu de 3 abas:
- **Gerenciar Edições:** cards com mês/ano, título e status; botões **Apagar**, **Editar** e **Link** (copia `…?edition=slug` para a área de transferência).
- **Nova Edição:** formulário com Mês/Ano, Título, slug, status (draft/published) e **editor visual rich text** (negrito, itálico, listas, títulos, links) que produz o HTML salvo em `content`. Reaproveitado para edição.
- **Ver Avaliações:** lista as avaliações recebidas por edição (nota, nome, cargo, comentário, data) com a média calculada.

## Detalhes Técnicos
- `bun add firebase` + `@fontsource/inter`; editor rich text via `@tiptap/react` (+ starter-kit) com toolbar customizada no tema dark.
- `src/lib/firebase.ts`: inicializa o app e exporta o Firestore.
- `src/lib/newsletters.ts` / `src/lib/evaluations.ts`: funções de leitura/escrita (queries por status, slug, média de notas) usadas via TanStack Query.
- Hero usa imagem local em `src/assets/vende-c.jpg` (placeholder até você enviar a sua).
- Guarda de rota: `/admin/dashboard` redireciona para `/admin` se não autenticado.
- **Regras do Firestore:** recomendo permitir leitura pública de `newsletters published` e criação pública de `evaluations`, restringindo escrita de `newsletters`. Como o login é hardcoded (sem Firebase Auth), a proteção de escrita no painel é client-side; posso documentar isso e sugerir regras condizentes.

## Observação de segurança
O login hardcoded e a escrita no Firestore sem Firebase Auth significam que a proteção do painel é apenas no front-end. Implemento exatamente como pedido, mas posso, em uma etapa futura, reforçar com Firebase Auth/regras se desejar.
