/* ATLAS 0.1 — interações locais de demonstração.
   * A conversa ainda não usa um modelo de IA nem envia dados a um servidor.
   */
(() => {
  const status = document.querySelector(".status span:last-child");
  const hint = document.querySelector(".hint");
  const subtitle = document.querySelector(".subtitle");
  const voiceButton = document.querySelector('[aria-label="Áudio"]');
  const navButtons = [...document.querySelectorAll(".nav-button")];

  const showMessage = (message) => {
    if (hint) hint.textContent = message;
  };

  const say = (message) => {
    if (!("speechSynthesis" in window)) {
      showMessage("A fala não é compatível com este navegador.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "pt-BR";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  const respond = (text) => {
    const query = text.toLocaleLowerCase("pt-BR");
    let answer;
    if (query.includes("seu nome") || query.includes("quem é você") || query.includes("quem e voce")) {
      answer = "Eu sou o ATLAS, seu assistente virtual. Esta é minha primeira versão de demonstração.";
    } else if (query.includes("hora")) {
      answer = "Ainda não tenho acesso ao relógio nesta demonstração. Podemos adicionar essa função depois.";
    } else if (query.includes("olá") || query.includes("ola") || query.includes("oi")) {
      answer = "Olá! Eu sou o ATLAS. Ainda estou em desenvolvimento, mas já estou aqui.";
    } else {
      answer = "Recebi sua mensagem: " + text + ". Minha conversa inteligente ainda será conectada em uma próxima etapa.";
    }
    if (status) status.textContent = "Demonstração de voz ativa";
    showMessage(answer);
    say(answer);
  };

  navButtons.forEach((button) => {
    if (button === voiceButton) return;
    button.addEventListener("click", () => {
      const label = button.getAttribute("aria-label");
      const messages = {
        "Início": "Você está na tela inicial do ATLAS.",
        "Conversas": "A área de conversas será construída na próxima etapa.",
        "Configurações": "As configurações ainda estão em desenvolvimento.",
        "Ajuda": "ATLAS 0.1: use o botão de áudio para testar a voz, se seu navegador for compatível."
      };
      showMessage(messages[label] || "Esta função será adicionada em breve.");
      if (status) status.textContent = label + " selecionado";
    });
  });

  if (voiceButton) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    voiceButton.addEventListener("click", () => {
      if (!Recognition) {
        const message = "Seu navegador não oferece reconhecimento de voz aqui. Você ainda pode testar os outros controles.";
        showMessage(message);
        if (status) status.textContent = "Reconhecimento de voz indisponível";
        return;
      }
      const recognition = new Recognition();
      recognition.lang = "pt-BR";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      if (status) status.textContent = "Ouvindo…";
      showMessage("Pode falar. Estou ouvindo.");
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        showMessage("Você: “" + transcript + "”");
        respond(transcript);
      };
      recognition.onerror = () => {
        if (status) status.textContent = "Não foi possível ouvir";
        showMessage("Não consegui captar sua voz. Confira a permissão do microfone e tente novamente.");
      };
      recognition.onend = () => {
        if (status && status.textContent === "Ouvindo…") status.textContent = "Pronto";
      };
      try {
        recognition.start();
      } catch (_) {
        showMessage("O reconhecimento já está ativo. Aguarde um instante e tente novamente.");
      }
    });
  }

  if (subtitle) {
    subtitle.setAttribute("aria-live", "polite");
  }
})();
