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
    const voiceSetting = document.querySelector("#voice-enabled");
    if (voiceSetting && !voiceSetting.checked) return;
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
      const app = document.querySelector(".app");
      const title = document.querySelector("#view-title");
      const panelHeading = document.querySelector("#panel-heading");
      const panelDescription = document.querySelector("#panel-description");
      const footnote = document.querySelector("#panel-footnote");
      app.classList.remove("chat-mode", "settings-mode", "help-mode");
      if (label === "Conversas") {
        app.classList.add("chat-mode");
        if (title) title.textContent = "Conversas";
        showMessage("Esta é a área de conversa do protótipo.");
        if (chatInput) chatInput.focus();
      } else if (label === "Configurações") {
        app.classList.add("settings-mode");
        if (title) title.textContent = "Configurações";
        if (panelHeading) panelHeading.textContent = "Configurações";
        if (panelDescription) panelDescription.textContent = "Escolha se o ATLAS deve falar as respostas usando a voz do navegador.";
        if (footnote) footnote.textContent = "Essa preferência vale neste navegador. O protótipo não envia áudio ou mensagens a um servidor de IA.";
        showMessage("Configurações da demonstração.");
      } else if (label === "Ajuda") {
        app.classList.add("help-mode");
        if (title) title.textContent = "Ajuda";
        if (panelHeading) panelHeading.textContent = "Como testar o ATLAS";
        if (panelDescription) panelDescription.textContent = "Digite uma mensagem na área Conversas. O microfone tenta reconhecer sua fala, se o navegador suportar e você autorizar o acesso.";
        if (footnote) footnote.textContent = "As respostas são pré-programadas. O ATLAS ainda não está conectado a uma inteligência artificial real.";
        showMessage("Ajuda do ATLAS.");
      } else {
        if (title) title.textContent = "";
        showMessage("Você está na tela inicial do ATLAS.");
        if (status) status.textContent = "Sistema visual inicializado";
      }
      if (label !== "Início" && status) status.textContent = label + " selecionado";
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
        if (chatInput) {
          const answer = sendDemoMessage(transcript);
          say(answer);
        } else {
          showMessage("Você: “" + transcript + "”");
          respond(transcript);
        }
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

  const chatForm = document.querySelector("#chat-form");
  const chatInput = document.querySelector("#chat-input");
  const chatLog = document.querySelector("#chat-log");
  const clearChatButton = document.querySelector("#clear-chat");
  const voiceEnabled = document.querySelector("#voice-enabled");
  const voicePreferenceKey = "atlas-demo-voice-enabled";
  try {
    const savedVoicePreference = window.localStorage.getItem(voicePreferenceKey);
    if (voiceEnabled && savedVoicePreference !== null) voiceEnabled.checked = savedVoicePreference === "true";
  } catch (_) {}
  if (voiceEnabled) {
    voiceEnabled.addEventListener("change", () => {
      try { window.localStorage.setItem(voicePreferenceKey, String(voiceEnabled.checked)); } catch (_) {}
      showMessage(voiceEnabled.checked ? "Respostas faladas ativadas." : "Respostas faladas desativadas.");
    });
  }
  const historyKey = "atlas-demo-chat-v1";
  let chatHistory = [];

  const renderChatHistory = () => {
    if (!chatLog) return;
    chatLog.replaceChildren();
    chatHistory.forEach((message) => {
      const item = document.createElement("div");
      item.className = "chat-message " + message.who;
      item.textContent = message.text;
      chatLog.appendChild(item);
    });
    chatLog.scrollTop = chatLog.scrollHeight;
  };

  const saveChatHistory = () => {
    try {
      window.localStorage.setItem(historyKey, JSON.stringify(chatHistory.slice(-40)));
    } catch (_) {
      showMessage("Não foi possível salvar a conversa neste navegador.");
    }
  };

  try {
    const saved = JSON.parse(window.localStorage.getItem(historyKey) || "[]");
    if (Array.isArray(saved)) {
      chatHistory = saved.filter((item) =>
        item && (item.who === "user" || item.who === "atlas") &&
        typeof item.text === "string"
      ).slice(-40);
    }
  } catch (_) {
    chatHistory = [];
  }
  renderChatHistory();

  const addChatMessage = (text, who) => {
    chatHistory.push({ text, who });
    chatHistory = chatHistory.slice(-40);
    renderChatHistory();
    saveChatHistory();
  };

  const sendDemoMessage = (message) => {
    addChatMessage(message, "user");
    const answer = getDemoAnswer(message);
    addChatMessage(answer, "atlas");
    showMessage("Mensagem recebida · modo de demonstração");
    if (status) status.textContent = "Conversa de demonstração";
    return answer;
  };

  if (chatForm && chatInput) {
    chatForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = chatInput.value.trim();
      if (!message) {
        chatInput.focus();
        return;
      }
      chatInput.value = "";
      sendDemoMessage(message);
      chatInput.focus();
    });
  }

  if (clearChatButton) {
    clearChatButton.addEventListener("click", () => {
      chatHistory = [];
      renderChatHistory();
      try {
        window.localStorage.removeItem(historyKey);
      } catch (_) {
        showMessage("A conversa foi limpa nesta tela, mas o navegador não permitiu apagar o histórico salvo.");
      }
      showMessage("Conversa limpa.");
      if (status) status.textContent = "Conversa limpa";
      if (chatInput) chatInput.focus();
    });
  }

  function getDemoAnswer(text) {
    const query = text.toLocaleLowerCase("pt-BR");
    if (query.includes("seu nome") || query.includes("quem é você") || query.includes("quem e voce")) {
      return "Eu sou o ATLAS, seu assistente virtual. Esta versão ainda é um protótipo e não está conectada a uma IA.";
    }
    if (query.includes("olá") || query.includes("ola") || query === "oi" || query.startsWith("oi ")) {
      return "Olá! Sou o ATLAS. Já consigo receber mensagens nesta demonstração; a inteligência artificial será conectada em uma próxima etapa.";
    }
    if (query.includes("ajuda") || query.includes("o que você faz") || query.includes("o que voce faz")) {
      return "Por enquanto, você pode testar esta conversa e o botão de áudio. Minhas respostas são de demonstração, não respostas de uma IA real.";
    }
    if (query.includes("atlas")) {
      return "Estou aqui! O núcleo visual e esta interface são a primeira base do projeto ATLAS.";
    }
    return "Recebi sua mensagem: “" + text + "”. Ainda não estou conectado a uma IA, então não consigo responder de forma inteligente de verdade. Essa será uma das próximas etapas.";
  }

  if (subtitle) {
    subtitle.setAttribute("aria-live", "polite");
  }
})();
