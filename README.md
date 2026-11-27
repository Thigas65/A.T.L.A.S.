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

## Integração opcional com G0DM0D3 (repositório do vídeo)

O backend do ATLAS pode consultar uma instância separada da API oficial do repositório [elder-plinius/G0DM0D3](https://github.com/elder-plinius/G0DM0D3). Esta é a API do projeto mostrado no vídeo, não o projeto aetherstate/GODMOD3.AI.

A ordem de tentativa do ATLAS permanece:
1. Cloudflare Workers AI (provedor principal atual).
2. G0DM0D3 (provedor adicional).
3. Groq (reserva atual).

O ATLAS usa o endpoint OpenAI-compatible `/v1/chat/completions` do G0DM0D3. Para manter a integração focada em qualidade e clareza, envia `autotune: true`, `godmode: false`, `parseltongue: false`, `stm_modules: ["hedge_reducer", "direct_mode"]` e `contribute_to_dataset: false`. Assim, o ATLAS não ativa os mecanismos de jailbreak/obfuscação nem envia conversas para o dataset opcional.

### 1. Hospedar a API G0DM0D3

Siga o README e a documentação API.md do repositório original. A API pode ser executada em um host de contêiner compatível com Node/Docker. Configure no serviço G0DM0D3:
- `GODMODE_API_KEY`: chave privada para autenticar o ATLAS.
- `OPENROUTER_API_KEY`: chave do provedor de modelos usada pelo G0DM0D3 no servidor.

Não deixe a autenticação desativada em um serviço público. Não habilite contribuição de conversas para o dataset.

### 2. Configurar o ATLAS

No ambiente do backend do ATLAS (por exemplo, Environment no Render), adicione:
| Variável | Valor |
|---|---|
| `G0DM0D3_API_URL` | URL base pública da API, sem `/v1` no final |
| `G0DM0D3_API_KEY` | Mesmo segredo configurado como `GODMODE_API_KEY` no serviço G0DM0D3 |
| `G0DM0D3_MODEL` | ID de um modelo individual disponível no OpenRouter, por exemplo `google/gemini-2.5-flash` |
| `G0DM0D3_OPENROUTER_API_KEY` | Opcional; use somente se o serviço G0DM0D3 não tiver `OPENROUTER_API_KEY` configurada |

As chaves ficam apenas no servidor; nunca as coloque no navegador ou no GitHub. Salve as variáveis e faça um novo deploy do ATLAS.

### 3. Verificar

Abra `/health` no endereço do ATLAS e confirme `g0dm0d3Configured: true`. Isso confirma apenas que URL e chave foram informadas. Depois envie uma mensagem de teste e confira nos logs do serviço se o provedor respondeu.

### Limites, custos e licença

A documentação da API informa que o nível Free tem limite total de 5 requisições por chave (além de limites por minuto e por dia). O ATLAS não elimina esses limites. O uso de modelos pelo OpenRouter também pode consumir créditos ou ter limites próprios; verifique os preços atuais antes de ativar.

O projeto é licenciado sob AGPL-3.0. Esta integração consome a API remota e não copia o código-fonte do G0DM0D3 para o ATLAS. Se futuramente o código for incorporado ou modificado dentro do ATLAS, será necessário avaliar e cumprir as condições da licença.
