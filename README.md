# ATLAS

Protótipo inicial da interface do **ATLAS**, um assistente virtual em desenvolvimento.

## O que já existe

- Interface visual escura com núcleo circular azul/ciano.
- Layout responsivo para computador e celular.
- Controles laterais de navegação demonstrativos.
- Campo de conversa por texto com respostas locais de demonstração.
- Teste experimental de reconhecimento e reprodução de voz, dependendo do navegador e das permissões.

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
4. Execute `npm test` para abrir a interface em um navegador automatizado e testar conversa, histórico, configurações, ajuda, adaptação de tela, acessibilidade do menu e indicação de recursos planejados.

## Arquivos principais

- `index.html` — estrutura da página e estilos.
- `app.js` — interações de demonstração por texto, navegação e voz.

O objetivo da próxima etapa é evoluir a interface e planejar uma conexão com IA que respeite os limites de custo e segurança.


## Menu lateral (versão 0.2)

O botão de três linhas abre o menu principal. Início, Nova conversa, Voz, Configurações e Ajuda têm ações implementadas. Histórico mostra as limitações do histórico local atual; Memória e Laboratório aparecem identificados como recursos planejados, sem fingir que já funcionam. O menu pode ser fechado pelo botão, pelo fundo escurecido ou pela tecla Escape.
