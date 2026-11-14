# TravessIA Mobile - Aplicativo React Native (Expo + TypeScript)

Aplicativo mobile desenvolvido em **React Native (Expo)** integrado ao backend de microsserviços Java (**GS_TravessIA**) para auxiliar pedestres **60+ e Pessoas com Deficiência (PCD)** na travessia segura de semáforos inteligentes.
O sistema resolve o problema do tempo curto do semaforos de travessia de pedestres em cruzamentos urbanos. 
A proposta é o usuario que deve ter mais 60 anos e/ou pcd ganhar mais tempo para atravessar a rua, sendo que em dias "secos" esse 
tempo a mais é de 5 segundos e dias chuvosos é de 10 segundos.


O app como estar em fase de teste vai ter as coordenadas do semaforos pre-fixadas, podendo escolher se estar perto ou longe de um dos semafors registrado. Sendo que so o Admin pode registrar ou deletar um semaforo.
No IOs tem a opção de usar a geolocalização do seu computador.
Na tela de login já tem um usuario e admin registrado, apaenas para facilitar e testar, só basta precionar um dos botões.


---

## 1. Atendimento aos Requisitos da Disciplina

1. **Requisito 1 - Telas e Navegação (7 Telas Distintas com React Navigation):**
   - `TelaLogin.tsx`: Login com autenticação real na API Java (`POST /api/auth/login`) e atalhos rápidos de teste (`maria_silva` e `admin_gutemberg`).
   - `TelaCadastro.tsx`: Cadastro (`POST /api/auth/signup`) com validação obrigatória para pessoas **60+** ou **PCD**.
   - `TelaSemaforos.tsx`: Listagem de semáforos (`GET /api/semaforos`), status ativo/inativo e exclusão (`DELETE /api/semaforos/{id}`).
   - `TelaTravessia.tsx`: Painel do Botão Inteligente de Travessia com validação de proximidade GPS (`<= 10m` via `GET /api/semaforos/{id}/proximidade`), simulador de distância (Perto ~5m vs Longe ~589m), requisição com Clima + IA (`POST /api/solicitacoes`) e cronômetro regressivo.
   - `TelaFormularioSemaforo.tsx`: Cadastro (`POST /api/semaforos`) e Edição/Ativação (`PUT /api/semaforos/{id}`) de semáforos pelo `ADMIN`.
   - `TelaHistorico.tsx`: Histórico de solicitações de travessia (`GET /api/solicitacoes` e `DELETE /api/solicitacoes/{id}`).
   - `TelaPerfil.tsx`: Edição do perfil logado (`PUT /api/usuarios/{id}`), gestão de usuários (`GET /api/usuarios`, `DELETE /api/usuarios/{id}`) e botão de **Logout**.

2. **Requisito 2 - CRUD Completo com API Java usando Axios:**
   - Todos os dados são consumidos e gravados diretamente no banco Oracle da FIAP através do `gateway-service` (`http://localhost:8080/api`).

3. **Requisito 3 - Sistema de Autenticação com Sessão de 1 Ano:**
   - Armazena o Token JWT (válido por 1 ano) e os dados do usuário no `AsyncStorage` (`ContextoAutenticacao.tsx`), mantendo o usuário logado mesmo ao fechar o app até realizar o logout manual.

4. **Requisito 4 e 5 - Identidade Visual e Arquitetura:**
   - Estrutura organizada em camadas dentro de `src/`:
     - `src/ativos/imagens/` (Logotipo e ilustrações personalizadas)
     - `src/componentes/` (`CabecalhoApp`, `BotaoPersonalizado`, `CampoTexto`, `MensagemFeedback`)
     - `src/contextos/` (`ContextoAutenticacao`)
     - `src/estilos/` (`tema`, `estilosGlobais`)
     - `src/navegacao/` (`NavegadorPrincipal`, `tiposNavegacao`)
     - `src/servicos/` (`clienteApi`, `servicoAutenticacao`, `servicoSemaforo`, `servicoSolicitacao`, `servicoUsuario`)
     - `src/telas/` (As 7 telas do aplicativo)
     - `src/tipos/` (`modelos`)

---

## 2. Como Rodar no Emulador iOS (Mac)

1. Certifique-se de que o backend Java (`GS_TravessIA`) está rodando no Docker:
   ```bash
   cd ../GS_TravessIA
   docker compose up -d
   ```

2. Entre na pasta do projeto React Native e inicie no Simulador iOS:
   ```bash
   cd ../GS_ReactNative_TravessIA
   npm run ios
   ```
   *(Ou rode `npx expo start` e pressione a tecla **`i`** no terminal para abrir automaticamente o iOS Simulator).*

## 3. Tem que rodar esses dois links para acordar o backend
   1. https://travessia-traffic.onrender.com/
   2. https://travessia-gateway.onrender.com/
   

## 🎥 Vídeo da Solução
https://vimeo.com/1246888541?share=copy&fl=sv&fe=ci


## 👥 Equipe de Desenvolvimento

- 👤 **Gutemberg RM - 562267**
- 👤 **Erik Naoki RM - 565771**
- 👤 **Juliana RM - 561171**
- 👤 **Gustavo RM - 561650**
- 👤 **João RM - 564361**



