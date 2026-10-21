# ATLAS

Protótipo web do **ATLAS**, um assistente virtual em desenvolvimento, com núcleo visual azul/ciano, interface responsiva, conversa, histórico local e recursos de voz do navegador.

## Integração com Gemini

O chat agora está preparado para enviar mensagens ao servidor local do ATLAS, que chama a API do Google Gemini. A chave da API fica **somente no servidor** e nunca deve ser colocada em `app.js`, `index.html` ou enviada em conversas.

### Configuração local

Requer Node.js 20 ou superior.

1. Configure a variável de ambiente `GEMINI_API_KEY` com a chave existente do Gemini. Não a coloque em arquivos versionados.
2. Ative a integração com `ATLAS_AI_ENABLED=true`.
3. Inicie o servidor da API com `npm run start:api`.
4. Em outro terminal, inicie o site na porta esperada pelo servidor: `npx http-server . -p 4173 -s`.
5. Abra `http://127.0.0.1:4173`.

No macOS/Linux, as variáveis podem ser definidas na sessão do terminal antes de iniciar o servidor:

```sh
export GEMINI_API_KEY="sua-chave"
export ATLAS_AI_ENABLED="true"
npm run start:api
```

No Windows PowerShell, use `$env:GEMINI_API_KEY="sua-chave"` e `$env:ATLAS_AI_ENABLED="true"` antes de `npm run start:api`.

O servidor usa `gemini-2.5-flash` por padrão; é possível alterar o modelo pela variável `GEMINI_MODEL`. A IA permanece desativada por padrão, mesmo que a chave esteja configurada: é necessário ativar explicitamente `ATLAS_AI_ENABLED=true`.

O servidor limita solicitações por endereço e tamanho de mensagem, restringe a origem padrão a `http://127.0.0.1:4173) e não registra mensagens nem chaves. Não exponha esse servidor diretamente à internet. Para hospedar publicamente, configure um backend protegido e ajuste a origem permitida para o domínio real do ATLAS. A configuração local com `127.0.0.1` não é, sozinha, uma implantação pública.

A API gratuita do Gemini tem limites e condições próprias. O código não garante uso ilimitado nem impede que o provedor aplique limites ou altere a disponibilidade.

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
- `app.js` — interação da interface e envio de mensagens ao backend.
- `server.js` — ponte protegida para a API do Gemini.
- `tests/atlas.spec.js` — testes de navegador.
