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
        if (footnote) footnote.textContent = "O chat está preparado para usar o Gemini quando o servidor e a chave estiverem configurados.";
        showMessage("Ajuda do ATLAS.");
      } else {
        if (title) title.textContent = "";
        showMessage("Você está na tela inicial do ATLAS.");
        if (status) status.textContent = "Sistema visual inicializado";
      }
      if (label !== "Início" && status) status.textContent = label + " selecionado";
    });
  });

  let activeRecognition = null;
  const setListeningState = (listening) => {
    if (!voiceButton) return;
    voiceButton.setAttribute("aria-pressed", String(listening));
    voiceButton.setAttribute("aria-label", listening ? "Parar de ouvir" : "Áudio");
    voiceButton.title = listening ? "Parar de ouvir" : "Falar com o ATLAS";
    voiceButton.classList.toggle("voice-listening", listening);
  };

  if (voiceButton) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    voiceButton.setAttribute("aria-pressed", "false");
    voiceButton.title = "Falar com o ATLAS";
    voiceButton.addEventListener("click", () => {
      if (activeRecognition) {
        activeRecognition.stop();
        showMessage("Parei de ouvir.");
        if (status) status.textContent = "Microfone pausado";
        return;
      }
      if (!Recognition) {
        showMessage("Este navegador não oferece reconhecimento de voz. Tente usar um navegador compatível ou digite sua mensagem.");
        if (status) status.textContent = "Reconhecimento de voz indisponível";
        return;
      }
      if (!window.isSecureContext && location.hostname !== "localhost") {
        showMessage("Para usar o microfone, abra o ATLAS por uma conexão segura (HTTPS).");
        if (status) status.textContent = "Conexão segura necessária";
        return;
      }
      const recognition = new Recognition();
      activeRecognition = recognition;
      recognition.lang = "pt-BR";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      setListeningState(true);
      if (status) status.textContent = "Ouvindo…";
      showMessage("Pode falar. Toque no microfone novamente para parar.");
      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim();
        if (!transcript) {
          showMessage("Não consegui entender. Tente falar novamente.");
          return;
        }
        if (chatInput) {
          chatInput.value = transcript;
          sendDemoMessage(transcript).then((answer) => {
            if (answer) say(answer);
          });
        } else {
          showMessage("Você: “" + transcript + "”");
          respond(transcript);
        }
      };
      recognition.onerror = (event) => {
        const messages = {
          "not-allowed": "O acesso ao microfone foi bloqueado. Permita o uso do microfone nas configurações do navegador.",
          "no-speech": "Não detectei fala. Toque no microfone e tente novamente.",
          "audio-capture": "Não encontrei um microfone disponível neste dispositivo."
        };
        if (status) status.textContent = "Não foi possível ouvir";
        showMessage(messages[event.error] || "Não consegui captar sua voz. Confira o microfone e a permissão do navegador.");
      };
      recognition.onend = () => {
        if (activeRecognition === recognition) activeRecognition = null;
        setListeningState(false);
        if (status && status.textContent === "Ouvindo…") status.textContent = "Pronto";
      };
      try {
        recognition.start();
      } catch (_) {
        activeRecognition = null;
        setListeningState(false);
        showMessage("Não consegui iniciar o microfone. Aguarde um instante e tente novamente.");
      }
    });
  }

  const chatForm = document.querySelector("#chat-form");
  const chatInput = document.querySelector("#chat-input");
  const chatLog = document.querySelector("#chat-log");
  const clearChatButton = document.querySelector("#clear-chat");
  const voiceEnabled = document.querySelector("#voice-enabled");

  const menuToggle = document.querySelector("#menu-toggle");
  const menuBackdrop = document.querySelector("#menu-backdrop");
  const sideMenu = document.querySelector("#atlas-menu");
  const featurePanel = document.querySelector("#feature-placeholder");
  const featureHeading = document.querySelector("#feature-heading");
  const featureDescription = document.querySelector("#feature-description");
  const featureState = document.querySelector("#feature-state");
  const setMenuOpen = (open) => {
    document.body.classList.toggle("menu-open", open);
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Fechar menu ATLAS" : "Abrir menu ATLAS");
    }
    if (sideMenu) {
      sideMenu.setAttribute("aria-hidden", String(!open));
      sideMenu.inert = !open;
    }
    if (open) sideMenu?.querySelector("button")?.focus();
    else menuToggle?.focus();
  };
  menuToggle?.addEventListener("click", () => setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true"));
  menuBackdrop?.addEventListener("click", () => setMenuOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("menu-open")) setMenuOpen(false);
  });
  const featureCopy = {
    history: ["Histórico", "As conversas ficam guardadas apenas neste navegador neste protótipo. A lista completa de conversas e a pesquisa ainda serão implementadas.", "HISTÓRICO SIMPLES DISPONÍVEL NO CHAT"],
    memory: ["Memória do ATLAS", "A memória permitirá guardar preferências escolhidas por você, consultar o que foi salvo e apagar tudo quando quiser. Ela ainda não está ativa e nada está sendo memorizado além do histórico local do chat.", "RECURSO PLANEJADO · AINDA DESATIVADO"],
    lab: ["Laboratório", "Um espaço futuro para experimentar ferramentas, integrações e novas capacidades do ATLAS. Vamos ativar cada ferramenta apenas quando estiver implementada e testada.", "RECURSO PLANEJADO · AINDA DESATIVADO"]
  };
  document.querySelectorAll("[data-menu-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.menuAction;
      setMenuOpen(false);
      document.querySelectorAll("[data-menu-action]").forEach((item) => item.removeAttribute("aria-current"));
      button.setAttribute("aria-current", "page");
      const app = document.querySelector(".app");
      app.classList.remove("chat-mode", "settings-mode", "help-mode", "feature-mode");
      if (action === "home") {
        showMessage("Você está na tela inicial do ATLAS.");
        if (status) status.textContent = "Sistema visual inicializado";
      } else if (action === "new-chat") {
        if (chatHistory.length) {
          chatHistory = [];
          renderChatHistory();
          try { localStorage.removeItem(historyKey); } catch (_) {}
        }
        app.classList.add("chat-mode");
        document.querySelector("#view-title").textContent = "Nova conversa";
        showMessage("Nova conversa iniciada.");
        chatInput?.focus();
      } else if (action === "history") {
        app.classList.add("feature-mode");
        document.querySelector("#view-title").textContent = "Histórico";
        featureHeading.textContent = featureCopy.history[0];
        featureDescription.textContent = chatHistory.length
          ? "Mensagens salvas neste navegador (" + chatHistory.length + "). O histórico não é enviado para nenhum servidor."
          : "Ainda não há mensagens salvas neste navegador. Comece uma conversa para ela aparecer aqui.";
        featureState.textContent = chatHistory.length
          ? "HISTÓRICO LOCAL · " + chatHistory.length + " MENSAGENS"
          : "NENHUMA MENSAGEM SALVA";
        const previousList = featurePanel.querySelector(".history-list");
        if (previousList) previousList.remove();
        if (chatHistory.length) {
          const list = document.createElement("ol");
          list.className = "history-list";
          chatHistory.forEach((message) => {
            const item = document.createElement("li");
            const speaker = document.createElement("strong");
            speaker.textContent = message.who === "user" ? "Você: " : "ATLAS: ";
            const content = document.createElement("span");
            content.textContent = message.text;
            item.append(speaker, content);
            list.appendChild(item);
          });
          featurePanel.appendChild(list);
        }
      } else if (action === "voice") {
        app.classList.add("settings-mode");
        document.querySelector("#view-title").textContent = "Voz";
        document.querySelector("#panel-heading").textContent = "Configurações de voz";
        document.querySelector("#panel-description").textContent = "Ative ou desative as respostas faladas. Para falar com o ATLAS, use o botão de microfone e permita o acesso quando solicitado.";
        document.querySelector("#panel-footnote").textContent = "O reconhecimento depende do navegador. As respostas ainda são demonstrativas.";
        document.querySelector("#voice-setting-row").style.display = "flex";
      } else if (action === "settings") {
        app.classList.add("settings-mode");
        document.querySelector("#view-title").textContent = "Configurações";
        document.querySelector("#panel-heading").textContent = "Configurações";
        document.querySelector("#panel-description").textContent = "Personalize as opções disponíveis nesta versão de demonstração.";
        document.querySelector("#panel-footnote").textContent = "As opções são locais neste protótipo. Ainda não existe conexão com uma IA.";
        document.querySelector("#voice-setting-row").style.display = "flex";
      } else if (action === "help") {
        app.classList.add("help-mode");
        document.querySelector("#view-title").textContent = "Ajuda e sobre";
        document.querySelector("#panel-heading").textContent = "Como testar o ATLAS";
        document.querySelector("#panel-description").textContent = "Digite uma mensagem na área Conversas. O microfone tenta reconhecer sua fala se o navegador suportar e você autorizar o acesso.";
        document.querySelector("#panel-footnote").textContent = "Versão 0.3 · integração com Gemini preparada; requer servidor e chave configurados.";
        document.querySelector("#voice-setting-row").style.display = "none";
      } else if (featureCopy[action]) {
        app.classList.add("feature-mode");
        document.querySelector("#view-title").textContent = featureCopy[action][0];
        featureHeading.textContent = featureCopy[action][0];
        featureDescription.textContent = featureCopy[action][1];
        featureState.textContent = featureCopy[action][2];
      }
    });
  });

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

  const API_URL = window.ATLAS_API_URL || (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://127.0.0.1:8787/api/chat" : "/.netlify/functions/chat");

  const sendDemoMessage = async (message) => {
    addChatMessage(message, "user");
    showMessage("Conectando ao Gemini…");
    if (status) status.textContent = "Aguardando resposta do Gemini";
    if (chatInput) chatInput.disabled = true;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        signal: AbortSignal.timeout(35_000)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Não foi possível obter uma resposta do Gemini.");
      if (typeof data.answer !== "string" || !data.answer.trim()) {
        throw new Error("O Gemini não retornou uma resposta válida.");
      }

      addChatMessage(data.answer.trim(), "atlas");
      showMessage("Resposta recebida do Gemini.");
      if (status) status.textContent = "Gemini conectado";
      return data.answer.trim();
    } catch (error) {
      const messageText = error && error.name === "TimeoutError"
        ? "O Gemini demorou demais para responder. Tente novamente."
        : (error && error.message || "").includes("Failed to fetch")
          ? "Não consegui acessar a IA. Se o site estiver publicado, confira a função do servidor e a variável GEMINI_API_KEY; se estiver local, inicie o servidor da API."
          : (error && error.message || "Não consegui conectar ao Gemini.");
      addChatMessage(messageText, "atlas");
      showMessage(messageText);
      if (status) status.textContent = "Conexão com IA indisponível";
      return "";
    } finally {
      if (chatInput) {
        chatInput.disabled = false;
        chatInput.focus();
      }
    }
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
