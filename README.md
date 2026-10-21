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

## Arquivos principais

- `index.html` — estrutura da página e estilos.
- `app.js` — interações de demonstração por texto, navegação e voz.

O objetivo da próxima etapa é evoluir a interface e planejar uma conexão com IA que respeite os limites de custo e segurança.
