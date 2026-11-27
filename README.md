# ATLAS

Protótipo web do **ATLAS**, um assistente virtual em desenvolvimento, com núcleo visual azul/ciano, interface responsiva, conversa, histórico local e recursos de voz do navegador.

## Integração com Gemini

O chat usa uma função de servidor para chamar a API do Google Gemini. A chave da API deve ficar somente nas variáveis de ambiente do servidor; nunca a coloque em `app.js`, `index.html` ou em um arquivo versionado.

### Publicar no Netlify

O repositório inclui `netlify.toml` e a função `netlify/functions/chat.js`.

1. Entre no Netlify e crie um site importando o repositório GitHub `Thigas65/A.T.L.A.S.`.
2. Nas configurações do site, abra **Environment variables** e adicione `GEMINI_API_KEY` com a chave da API do Gemini. Não compartilhe a chave nem a coloque no código.
3. Adicione `ATLAS_AI_ENABLED` com o valor `true` para ativar a IA. Sem isso, a função fica desligada para evitar chamadas acidentais.
4. Opcionalmente, defina `GEMINI_MODEL` como `gemini-2.5-flash` (esse é o padrão).
5. Faça um novo deploy após salvar as variáveis.
6. Abra o endereço público do site e teste o chat.

A chave secreta de GitHub Actions não é transferida automaticamente ao Netlify. A variável `GEMINI_API_KEY` precisa ser cadastrada nas configurações do site hospedado. A função responde com erro claro se a variável estiver ausente.

**Importante:** os arquivos e a configuração agora estão preparados para o Netlify, mas o site não é publicado automaticamente por este repositório. É necessário conectar o repositório à conta Netlify e configurar a variável de ambiente. Não foi feita uma chamada real à API nesta etapa, então a integração ainda precisa ser testada após o deploy.

### Executar localmente

Requer Node.js 20 ou superior.

1. Configure as variáveis de ambiente `GEMINI_API_KEY` e `ATLAS_AI_ENABLED=true`.
2. Inicie o servidor local com `npm run start:api`.
3. Em outro terminal, inicie o site: `npx http-server . -p 4173 -s`.
4. Abra `http://127.0.0.1:4173`.

No macOS/Linux, defina as variáveis na sessão do terminal antes de iniciar o servidor:

```sh
export GEMINI_API_KEY="sua-chave"
export ATLAS_AI_ENABLED="true"
npm run start:api
```

No Windows PowerShell:

```powershell
$env:GEMINI_API_KEY="sua-chave"
$env:ATLAS_AI_ENABLED="true"
npm run start:api
```

O servidor local usa `gemini-2.5-flash` por padrão. A IA permanece desativada por padrão no servidor local, mesmo que a chave esteja configurada: é necessário definir `ATLAS_AI_ENABLED=true`.

## Interface e recursos

- Núcleo circular azul/ciano e layout responsivo.
- Navegação lateral, menu principal, configurações e ajuda.
- Conversa e histórico armazenados localmente no navegador.
- Reconhecimento e síntese de voz dependentes do navegador.
- O microfone não é uma escuta contínua; depende de permissão e suporte do navegador.

## Testes

```sh
npm install
npx playwright install chromium
npm run test:syntax
npm test
```

Os testes de interface simulam a resposta da API para não consumir a cota real do Gemini.

## Arquivos principais

- `index.html` — estrutura e estilos.
- `app.js` — interação da interface e envio de mensagens à API.
- `server.js` — ponte local para a API do Gemini.
- `netlify/functions/chat.js` — ponte do chat para o Gemini no Netlify.
- `netlify.toml` — configuração de publicação e funções do Netlify.
- `tests/atlas.spec.js` — testes de navegador.

## Integração opcional com GODMOD3.AI

O servidor do ATLAS pode usar uma instância separada da API GODMOD3 como alternativa adicional de IA. A ordem de tentativa é:

1. Cloudflare Workers AI (provedor principal atual).
2. GODMOD3 / ULTRAPLINIAN (alternativa adicional).
3. Groq (reserva atual).

O ATLAS se conecta à API por HTTP e **não copia o código-fonte do GODMOD3 para este repositório**. A instância GODMOD3 precisa ser hospedada separadamente; este commit apenas prepara o ATLAS para consumi-la.

### 1. Hospedar a API GODMOD3

Siga a documentação oficial do projeto [GODMOD3.AI](https://github.com/aetherstate/GODMOD3.AI), usando o Dockerfile/API do próprio repositório. Na configuração do serviço GODMOD3, defina os segredos:

- `GODMODE_API_KEY`: chave privada que o ATLAS usará para autenticar.
- `OPENROUTER_API_KEY`: chave usada pelo GODMOD3 para consultar os modelos.

Não publique essas chaves no GitHub nem no navegador. Não habilite a opção de contribuição para dataset; o ATLAS não envia essa opção nas requisições.

### 2. Configurar o serviço do ATLAS

No painel do serviço que hospeda o backend do ATLAS (por exemplo, Environment no Render), adicione:

| Variável | Valor |
|---|---|
| `GODMOD3_API_URL` | URL base pública da API GODMOD3, sem `/v1` no final |
| `GODMOD3_API_KEY` | O mesmo valor definido em `GODMODE_API_KEY` no serviço GODMOD3 |
| `GODMOD3_MODEL` | `ultraplinian/fast` |

Salve as variáveis e faça um novo deploy do ATLAS. A integração é opcional: se as variáveis não existirem, o ATLAS continua usando os provedores que já estavam configurados.

### 3. Verificar

Abra `/health` no endereço do ATLAS e confirme `godmod3Configured: true`. Esse indicador só confirma que URL e chave foram configuradas; para validar a conexão real, envie uma mensagem de teste pelo chat e confira se o provedor retornado é `GODMOD3 (ULTRAPLINIAN)`.

### Limites e custos

A documentação da API GODMOD3 descreve o nível Free com limite total de 5 requisições por chave, além de limites por minuto e por dia. O mecanismo ULTRAPLINIAN consulta vários modelos, então o uso do OpenRouter pode ter custos ou limites próprios, conforme os modelos e a conta configurados. Não considere a integração ilimitada ou necessariamente gratuita. Consulte os limites e preços atuais antes de ativar o serviço.

O GODMOD3 é licenciado sob AGPL-3.0. Esta integração usa a API remota e não incorpora código do projeto; se futuramente houver cópia ou modificação do código GODMOD3 dentro do ATLAS, será necessário avaliar e cumprir as obrigações da licença.

