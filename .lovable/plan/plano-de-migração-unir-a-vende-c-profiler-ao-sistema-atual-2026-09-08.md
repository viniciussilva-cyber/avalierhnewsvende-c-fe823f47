# Plano de migração: unir a VENDE-C Profiler ao sistema atual

## Objetivo
Traz o módulo **VENDE-C Profiler** (avaliação comportamental DISC de colaboradores) da conta `vendec-profile-pro.lovable.app` para dentro deste projeto, como mais um módulo acessível pelo hub `/app`. Os dados e telas passam a conviver com RH News e R&S.

## Como obter o material da outra plataforma
1. **Código-fonte:** na outra conta, copie manualmente os arquivos principais (`src/lib/hr.functions.ts`, `src/routes/rh.dashboard.tsx`, `src/routes/resultado.$employeeId.tsx`, `src/components/ResultReport.tsx`, `src/components/EmployeeForm.tsx`, `src/lib/gate.server.ts`, etc.) para um arquivo texto/zip.
2. **Banco de dados:** no outro projeto, vá em **Cloud → Advanced settings → Export data** e baixe as tabelas (`employees`, `assessments`, `user_roles`, etc.).
3. **Alternativa:** convidar este usuário/agente para o outro projeto no Lovable, se a funcionalidade de convite estiver disponível.

## Estratégia de integração
- O módulo Profiler vira um card no hub `/app`, ao lado de "RH News" e "R&S".
- As rotas do Profiler ficam sob `/app/profiler/*`, mantendo URLs separadas mas dentro do mesmo domínio/login.
- O design segue o sistema atual: fundo `#0a0a0a`, cards `#111111`, cor de marca rosa `#ff0055`/`#ff006a` (já é a cor primária deste projeto).
- A autenticação unifica no Firebase Auth atual: quem entra como `rh` vê o dashboard de RH; quem entra como `gestor` vê a visão de líder/time.

## Passos de implementação

### 1. Preparação do banco de dados
- Criar as tabelas necessárias no Supabase deste projeto, espelhando o schema da outra plataforma:
  - `employees` (dados dos colaboradores)
  - `assessments` (resultados DISC)
  - `user_roles` (papéis, se for usar RLS futuramente)
  - Funções auxiliares como `has_role`, `can_view_employee`, etc.
- Aplicar `GRANT` e RLS/policies conforme as regras do Lovable Cloud.
- Criar triggers de `updated_at` para as novas tabelas.

### 2. Migração dos dados
- Importar os dados exportados da outra conta para as novas tabelas deste projeto.
- Validar se os IDs e relacionamentos (`employee_id`, `assessment_id`) permanecem consistentes.

### 3. Replicação e adaptação do código
- Criar `src/lib/profiler.functions.ts` com as server functions equivalentes ao `hr.functions.ts` da outra plataforma.
- Criar/adaptar componentes:
  - `EmployeeForm.tsx` para cadastro/edição de colaboradores.
  - `ResultReport.tsx` para o relatório DISC (mantendo gráficos, radar, mapa de talentos e exportação PDF via `window.print()`).
- Criar rotas:
  - `/app/profiler` → dashboard de colaboradores (visão RH).
  - `/app/profiler/colaborador/$employeeId` → relatório individual.
  - `/app/profiler/lider` → visão de líder/time (visão gestor).

### 3b. Personagens no final do resultado
- Recortar a imagem enviada em quatro personagens individuais: **Analista**, **Planejador**, **Executor** e **Comunicador**.
- Publicar cada personagem como asset do projeto e exibir ao final do relatório da avaliação, destacando o perfil predominante do colaborador.
- Cada personagem acompanha o selo colorido e a frase correspondente:
  - Analista — roxo — "Observa, analisa e encontra o que outros não veem."
  - Planejador — azul — "Pensa no hoje, projeta o amanhã."
  - Executor — verde — "Tira do papel e faz acontecer."
  - Comunicador — laranja — "Conecta pessoas, compartilha ideias e gera movimento."
- O personagem do perfil predominante aparece em destaque; os demais aparecem menores como referência.

### 4. Autenticação unificada
- Reaproveitar `src/lib/auth.ts` e `src/lib/roles.ts`.
- Mapear papéis:
  - `rh` do sistema atual → acesso total ao Profiler (dashboard RH).
  - `gestor` do sistema atual → visão de líder/time.
- Remover a senha compartilhada do Profiler; o acesso passa a ser controlado pelo login unificado.

### 5. Integração no hub
- Adicionar um novo card "Profiler / DISC" em `/app/index.tsx`.
- O card fica disponível para `rh` e `gestor` (gestor acessa apenas a visão de líder).

### 6. Ajustes e testes
- Verificar conflitos de nomes de rotas e componentes.
- Testar o fluxo de cadastro de colaborador, visualização do relatório e exportação PDF.
- Garantir que as cores e tipografia do Profiler conversem com o design system atual.

## Decisões pendentes
- A tela "Meu resultado" da outra plataforma está quebrada. Decidir se será removida, transformada em seletor de colaborador ou corrigida com login individual no futuro.
- O questionário DISC hoje só pode ser preenchido inserindo dados direto no banco. Decidir se queremos construir a tela de aplicação do questionário agora ou manter a carga manual de avaliações.

## Entregáveis
- Novas tabelas no Supabase deste projeto.
- Dados da outra plataforma importados.
- Módulo Profiler acessível pelo hub `/app`.
- Login unificado com Firebase Auth.
- Rotas: `/app/profiler`, `/app/profiler/colaborador/$id`, `/app/profiler/lider`.
