# ATLAS

Protótipo inicial da interface do **ATLAS**, um assistente virtual em desenvolvimento.

## O que já existe

- Interface visual escura com núcleo circular azul/ciano.
- Layout responsivo para computador e celular.
- Controles laterais de navegação demonstrativos.
- Campo de conversa por texto com respostas locais de demonstração.
- Reconhecimento de fala em português (Brasil), com botão para iniciar/parar e feedback visual de escuta, dependendo do navegador e das permissões.
- Respostas faladas usando a síntese de voz do navegador, com preferência ativável nas configurações.

## Como testar

1. Abra o arquivo `index.html` no navegador, ou abra o repositório no GitHub Codespaces.
2. Digite uma mensagem no campo **“Converse com o ATLAS...”** e pressione Enter ou o botão de envio.
3. Para testar voz, use o botão de microfone e permita o acesso ao microfone quando o navegador solicitar.

## Importante

Esta é uma **demonstração local**. As respostas de texto são pré-programadas e o recurso de voz depende do suporte do navegador. O projeto ainda não está conectado a um modelo de inteligência artificial, não possui memória de conversas e não envia mensagens a um servidor.

## Testes automatizados

O repositório inclui testes de navegador com Playwright e uma rotina do GitHub Actions que roda a cada envio de código e em pull requests.

Para executar localmente, com Node.js instalado:

1. Execute `npm install`.
2. Execute `npx playwright install chromium`.
3. Execute `npm run test:syntax` para verificar a sintaxe JavaScript.
4. Execute `npm test` para abrir a interface em um navegador automatizado e testar conversa, histórico, configurações, ajuda, adaptação de tela, acessibilidade do menu, recursos planejados e controles de voz.

## Arquivos principais

- `index.html` — estrutura da página e estilos.
- `app.js` — interações de demonstração por texto, navegação e voz.

O reconhecimento de fala e a síntese de voz são independentes da futura integração com IA: neste momento, o ATLAS ainda responde com frases demonstrativas. O reconhecimento depende do navegador e pode usar serviços do próprio navegador; não é um sistema de escuta contínua nem funciona com o dispositivo desligado. A integração futura com assistente doméstico/wake word será uma etapa separada.


## Menu lateral (versão 0.2)

O botão de três linhas abre o menu principal. Início, Nova conversa, Voz, Configurações e Ajuda têm ações implementadas. Histórico mostra as limitações do histórico local atual; Memória e Laboratório aparecem identificados como recursos planejados, sem fingir que já funcionam. O menu pode ser fechado pelo botão, pelo fundo escurecido ou pela tecla Escape.
