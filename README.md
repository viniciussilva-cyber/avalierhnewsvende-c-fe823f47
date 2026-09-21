# RH News Hub

Crie uma aplicação web em React (com Tailwind CSS e Lucide Icons) para ser uma plataforma de leitura e avaliação de newsletters internas, chamada "RH NEWS VENDE-C". O aplicativo deve ter integração com Firebase (Firestore) para persistência de dados.

### 1. Sistema de Cores e Tipografia (Design System)
- **Tema:** Dark Mode (Totalmente escuro).
- **Cores principais:** - Fundos: `#0a0a0a` (página geral), `#111111` (cards e seções internas), `#050505` (headers).
  - Destaque/Acento: Rosa/Magenta Vende-C (`#FF0055`).
  - Textos: Branco puro, `#e5e5e5` (títulos) e cinza `#9ca3af` ou `#6b7280` para textos secundários.
- **Tipografia:** Fonte 'Inter' em toda a aplicação.

### 2. Estrutura de Dados (Firebase Firestore)
A aplicação precisa de duas coleções no banco de dados:
- `newsletters`: id (slug amigável como "julho-2026"), title, monthYear, content (HTML rico em formato string), status ("draft" ou "published").
- `evaluations`: newsletterId, rating (número de 0 a 10), name, role, comment (opcional), date.

### 3. Tela Pública (Visão do Colaborador)
Esta tela lê o parâmetro da URL `?edition=slug-da-edicao` para renderizar o conteúdo específico. Se não houver parâmetro, exibe a edição 'published' mais recente.
- **Header:** Logo simples com ícone de jornal, título "RH News" e subtítulo "Newsletter interno".
- **Hero Section:** Imagem de fundo local (chamada 'vende-c.jpg') com um overlay escuro (`bg-black/50` e gradiente para baixo). Deve exibir a tag do mês/ano, o Título da edição, a Nota Média Geral (calculada com base nas avaliações) e um botão "Ler e avaliar".
- **Comportamento do Botão:** Ao clicar no botão "Ler e avaliar", a tela rola suavemente (smooth scroll) para baixo, revelando o formulário de avaliação.
- **Formulário de Avaliação:** Fica posicionado ANTES do conteúdo da newsletter. Pergunta "De 0 a 10, que nota você dá?". Tem inputs obrigatórios de Nome Completo e Cargo, e um textarea opcional para comentários/melhorias. Após envio, exibir mensagem de sucesso de agradecimento.
- **Conteúdo da Newsletter:** Renderiza o HTML rico (usando tipografia `prose` do Tailwind, adaptada para dark mode).
- **Outras Edições (Footer):** Um grid mostrando as edições publicadas anteriores. Ao clicar, atualiza o parâmetro `?edition=...` na URL e recarrega a visualização.

### 4. Acesso Moderador (Login)
- Tela simples com fundo `#111`.
- Acesso bloqueado por "hardcode". E-mails permitidos: "vinicius.silva@vende-c.com" e "lucas.izan@vende-c.com". Senha única e eterna: "rh2026!".
- Opção de mostrar/ocultar senha no input. Sem opção de redefinir senha.

### 5. Painel do Moderador (Dashboard)
Tem uma Hero Section igual à página pública e um menu de 3 abas:
- **Aba "Gerenciar Edições":** Lista em cards as edições criadas. Mostra mês/ano, título e status. Tem botões de "Apagar", "Editar" e "Link" (que copia a URL amigável da edição `?edition=slug` para a área de transferência do usuário).
- **Aba "Nova Edição":** Formulário com Mês/Ano, Título

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://avalierhnewsvende-c.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9f65e3a8-eb94-48e3-a4b1-24d90a8acad2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development
 
Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
