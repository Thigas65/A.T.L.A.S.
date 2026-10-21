/* ATLAS 0.1 — interações locais de demonstração.
   * A conversa ainda não usa um modelo de IA nem envia dados a um servidor.
   */
(() => {
  const params = new URLSearchParams(window.location.search);
  const userAgent = navigator.userAgent || "";
  const isSamsungTV = /SMART-TV|SmartTV|Tizen.*TV|TV.*Tizen/i.test(userAgent);
  const isTVMode = params.get("tv") === "1" || isSamsungTV;
  if (isTVMode) {
    document.body.classList.add("tv-mode");
    document.title = "ATLAS Core";
  }
  const status = document.querySelector(".status span:last-child");
  const hint = document.querySelector(".hint");
  const subtitle = document.querySelector(".subtitle");
  const voiceButton = document.querySelector('[aria-label="Áudio"]');
  const coreWrap = document.querySelector("#atlas-core");
  const wakeWordToggle = document.querySelector("#wake-word-toggle");
  const permissionNote = document.querySelector("#voice-permission-note");
  const navButtons = [...document.querySelectorAll(".nav-button")];
  if (isTVMode) {
    if (status) status.textContent = "Núcleo visual ativo · modo TV";
    if (hint) hint.textContent = "Para comandos de voz, use o celular.";
    if (permissionNote) permissionNote.textContent = "O navegador da TV é usado aqui como tela visual do ATLAS.";
  }

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
    utterance.onstart = () => coreWrap?.classList.add("is-speaking");
    utterance.onend = () => coreWrap?.classList.remove("is-speaking");
    utterance.onerror = () => coreWrap?.classList.remove("is-speaking");
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
  let wakeWordActive = false;
  let awaitingCommand = false;
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const setListeningState = (listening) => {
    if (voiceButton) {
      voiceButton.setAttribute("aria-pressed", String(listening));
      voiceButton.setAttribute("aria-label", listening ? "Parar de ouvir" : "Áudio");
      voiceButton.title = listening ? "Parar de ouvir" : "Falar com o ATLAS";
      voiceButton.classList.toggle("voice-listening", listening);
    }
    coreWrap?.classList.toggle("is-listening", listening);
    if (wakeWordToggle) {
      wakeWordToggle.setAttribute("aria-pressed", String(wakeWordActive));
      wakeWordToggle.textContent = wakeWordActive ? "Desativar palavra-chave “Atlas”" : "Ativar palavra-chave “Atlas”";
    }
  };

  const normalizeVoiceText = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
  const processVoiceCommand = async (transcript) => {
    const command = transcript.trim();
    if (!command) return;
    if (chatInput) {
      chatInput.value = command;
      const answer = await sendDemoMessage(command);
      if (answer) say(answer);
    } else {
      showMessage("Você: “" + command + "”");
      respond(command);
    }
  };

  const startRecognition = (forWakeWord = false) => {
    if (!Recognition) {
      showMessage("Este navegador não oferece reconhecimento de voz. Use um navegador compatível ou digite sua mensagem.");
      if (status) status.textContent = "Reconhecimento de voz indisponível";
      wakeWordActive = false;
      setListeningState(false);
      return;
    }
    if (!window.isSecureContext && location.hostname !== "localhost") {
      showMessage("Para usar o microfone, abra o ATLAS por uma conexão segura (HTTPS).");
      if (status) status.textContent = "Conexão segura necessária";
      wakeWordActive = false;
      setListeningState(false);
      return;
    }
    const recognition = new Recognition();
    activeRecognition = recognition;
    recognition.lang = "pt-BR";
    recognition.continuous = Boolean(forWakeWord);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListeningState(true);
    if (status) status.textContent = forWakeWord ? "Aguardando “Atlas”" : "Ouvindo…";
    showMessage(forWakeWord
      ? "Escuta ativada. Diga “Atlas” para chamar o assistente. Deixe esta página aberta e visível."
      : "Pode falar. Toque no microfone novamente para parar.");

    recognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index++) {
        const result = event.results[index];
        if (!result.isFinal) continue;
        const transcript = result[0]?.transcript?.trim();
        if (!transcript) continue;
        if (!forWakeWord) {
          processVoiceCommand(transcript);
          continue;
        }

        const normalized = normalizeVoiceText(transcript);
        if (awaitingCommand) {
          awaitingCommand = false;
          showMessage("Comando recebido.");
          processVoiceCommand(transcript);
          if (status) status.textContent = "Executando comando solicitado";
          continue;
        }

        const wakeMatch = normalized.match(/(?:^|\s)atlas\b[\s,.:;!?-]*(.*)$/i);
        if (!wakeMatch) continue;
        const command = wakeMatch[1].trim();
        if (command) {
          processVoiceCommand(command);
        } else {
          awaitingCommand = true;
          showMessage("Estou ouvindo. Diga seu comando agora.");
          if (status) status.textContent = "Palavra-chave reconhecida";
        }
      }
    };
    recognition.onerror = (event) => {
      const messages = {
        "not-allowed": "O acesso ao microfone foi negado. Autorize o microfone nas permissões do navegador.",
        "no-speech": forWakeWord ? "Não detectei fala. A escuta por palavra-chave será retomada se o navegador permitir." : "Não detectei fala. Toque no microfone e tente novamente.",
        "audio-capture": "Não encontrei um microfone disponível neste dispositivo."
      };
      if (status) status.textContent = "Não foi possível ouvir";
      showMessage(messages[event.error] || "Não consegui captar sua voz. Confira o microfone e a permissão do navegador.");
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        wakeWordActive = false;
        setListeningState(false);
      }
    };
    recognition.onend = () => {
      if (activeRecognition === recognition) activeRecognition = null;
      setListeningState(false);
      if (wakeWordActive && document.visibilityState === "visible") {
        window.setTimeout(() => {
          if (wakeWordActive && !activeRecognition && document.visibilityState === "visible") startRecognition(true);
        }, 450);
      } else if (wakeWordActive) {
        wakeWordActive = false;
        awaitingCommand = false;
        if (status) status.textContent = "Escuta pausada";
        showMessage("A escuta foi pausada porque a página ficou em segundo plano. Ative novamente quando voltar.");
        setListeningState(false);
      } else if (status && (status.textContent === "Ouvindo…" || status.textContent === "Aguardando “Atlas”")) {
        status.textContent = "Pronto";
      }
    };
    try {
      recognition.start();
    } catch (_) {
      activeRecognition = null;
      if (!forWakeWord) wakeWordActive = false;
      setListeningState(false);
      showMessage("Não consegui iniciar o microfone. Aguarde um instante e tente novamente.");
    }
  };

  const stopListening = () => {
    wakeWordActive = false;
    awaitingCommand = false;
    const recognition = activeRecognition;
    activeRecognition = null;
    if (recognition) {
      try { recognition.stop(); } catch (_) {}
    }
    setListeningState(false);
    if (status) status.textContent = "Microfone pausado";
    showMessage("Escuta desativada.");
  };

  const requestMicrophonePermission = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      showMessage("Este navegador não permite solicitar o microfone. Confira as permissões do site e tente novamente.");
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      showMessage(error?.name === "NotAllowedError"
        ? "Você não autorizou o microfone. Para ativar a voz, permita o acesso nas configurações do navegador."
        : "Não consegui acessar o microfone. Confira se ele está disponível e tente novamente.");
      return false;
    }
  };

  wakeWordToggle?.addEventListener("click", async () => {
    if (wakeWordActive || activeRecognition) {
      stopListening();
      if (permissionNote) permissionNote.textContent = "Escuta desativada. O microfone só volta a ser usado quando você ativar novamente.";
      return;
    }
    if (!Recognition) {
      showMessage("Este navegador não oferece reconhecimento de voz. Digite sua mensagem ou tente um navegador compatível.");
      return;
    }
    if (permissionNote) permissionNote.textContent = "O navegador vai solicitar acesso ao microfone. Você pode negar ou desativar a escuta a qualquer momento.";
    const granted = await requestMicrophonePermission();
    if (!granted) return;
    wakeWordActive = true;
    awaitingCommand = false;
    if (permissionNote) permissionNote.textContent = "Escuta por “Atlas” ativa enquanto esta página estiver aberta e visível. Não funciona com o navegador fechado ou o celular bloqueado.";
    startRecognition(true);
  });

  voiceButton?.addEventListener("click", () => {
    if (activeRecognition || wakeWordActive) {
      stopListening();
      return;
    }
    startRecognition(false);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible" && wakeWordActive) {
      wakeWordActive = false;
      awaitingCommand = false;
      const recognition = activeRecognition;
      activeRecognition = null;
      if (recognition) {
        try { recognition.stop(); } catch (_) {}
      }
      setListeningState(false);
      if (status) status.textContent = "Escuta pausada";
      showMessage("Por privacidade e pelas limitações do navegador, a escuta para quando a página fica em segundo plano.");
    }
  });

  const chatForm = document.querySelector("#chat-form");
  const chatInput = document.querySelector("#chat-input");
  const chatLog = document.querySelector("#chat-log");
  const clearChatButton = document.querySelector("#clear-chat");
  const voiceEnabled = document.querySelector("#voice-enabled");
  voiceEnabled?.addEventListener("change", () => {
    if (!voiceEnabled.checked && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      coreWrap?.classList.remove("is-speaking");
      showMessage("Respostas faladas desativadas. Você pode reativá-las nas configurações.");
    } else if (voiceEnabled.checked) {
      showMessage("Respostas faladas ativadas.");
    }
  });

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
  const memoryKey = "atlas-user-memories-v1";
  const loadMemories = () => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(memoryKey) || "[]");
      return Array.isArray(saved) ? saved.filter((item) => typeof item === "string" && item.trim()).slice(0, 12) : [];
    } catch (_) { return []; }
  };
  let userMemories = loadMemories();
  const persistMemories = () => {
    try {
      window.localStorage.setItem(memoryKey, JSON.stringify(userMemories));
      return true;
    } catch (_) {
      showMessage("Não consegui salvar a memória neste navegador.");
      return false;
    }
  };
  const featureCopy = {
    history: ["Histórico", "As mensagens da conversa atual ficam guardadas neste navegador. Você pode limpar a conversa pelo botão no chat.", "HISTÓRICO LOCAL"],
    memory: ["Memória do ATLAS", "Guarde apenas informações que você queira que o ATLAS use como contexto. As memórias ficam neste navegador e são enviadas ao Gemini junto com suas mensagens para personalizar as respostas.", "MEMÓRIA LOCAL ATIVADA"],
    lab: ["Ferramentas do ATLAS", "Use comandos simples no chat: pergunte “que horas são?” ou “que dia é hoje?”. Para contas, escreva “calcule 125 * (8 + 2)”.", "DATA, HORA E CALCULADORA BÁSICA DISPONÍVEIS"]
  };

  const renderMemoryManager = () => {
    if (!featurePanel) return;
    featurePanel.querySelector(".memory-manager")?.remove();
    const manager = document.createElement("div");
    manager.className = "memory-manager";
    manager.style.cssText = "display:grid;gap:12px;margin-top:18px;text-align:left";
    const label = document.createElement("label");
    label.htmlFor = "atlas-memory-input";
    label.textContent = "Nova memória (máximo 180 caracteres)";
    const input = document.createElement("input");
    input.id = "atlas-memory-input";
    input.maxLength = 180;
    input.placeholder = "Ex.: Prefiro respostas curtas e em português.";
    input.style.cssText = "width:100%;padding:12px;border-radius:10px;border:1px solid #168bce;background:#06152c;color:#fff";
    const save = document.createElement("button");
    save.type = "button";
    save.textContent = "Salvar memória";
    save.style.cssText = "padding:11px 14px;border-radius:10px;border:1px solid #00cfff;background:#06346b;color:#fff;cursor:pointer";
    const list = document.createElement("div");
    list.style.cssText = "display:grid;gap:8px";
    const renderList = () => {
      list.replaceChildren();
      if (!userMemories.length) {
        const empty = document.createElement("p");
        empty.textContent = "Nenhuma memória salva ainda.";
        list.appendChild(empty);
      }
      userMemories.forEach((memory, index) => {
        const row = document.createElement("div");
        row.style.cssText = "display:flex;gap:10px;align-items:center;justify-content:space-between;padding:10px;border:1px solid rgba(0,190,255,.35);border-radius:10px";
        const text = document.createElement("span");
        text.textContent = memory;
        text.style.cssText = "overflow-wrap:anywhere;flex:1";
        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "Apagar";
        remove.setAttribute("aria-label", "Apagar memória " + (index + 1));
        remove.style.cssText = "padding:7px 10px;border-radius:8px;border:1px solid #b54a67;background:#391326;color:#fff;cursor:pointer";
        remove.addEventListener("click", () => {
          userMemories.splice(index, 1);
          persistMemories();
          renderList();
          featureState.textContent = "MEMÓRIAS SALVAS: " + userMemories.length;
        });
        row.append(text, remove);
        list.appendChild(row);
      });
    };
    save.addEventListener("click", () => {
      const value = input.value.trim();
      if (!value) { input.focus(); return; }
      if (userMemories.length >= 12) {
        showMessage("Você já tem 12 memórias. Apague uma antes de adicionar outra.");
        return;
      }
      userMemories.push(value);
      if (persistMemories()) {
        input.value = "";
        renderList();
        featureState.textContent = "MEMÓRIAS SALVAS: " + userMemories.length;
        showMessage("Memória salva neste navegador.");
      }
    });
    const clear = document.createElement("button");
    clear.type = "button";
    clear.textContent = "Apagar todas as memórias";
    clear.style.cssText = "padding:10px;border-radius:10px;border:1px solid #b54a67;background:#391326;color:#fff;cursor:pointer";
    clear.addEventListener("click", () => {
      userMemories = [];
      persistMemories();
      renderList();
      featureState.textContent = "MEMÓRIAS SALVAS: 0";
      showMessage("Todas as memórias foram apagadas.");
    });
    manager.append(label, input, save, list, clear);
    featurePanel.appendChild(manager);
    renderList();
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
        startNewConversation();
        app.classList.add("chat-mode");
        document.querySelector("#view-title").textContent = "Nova conversa";
        showMessage("Nova conversa iniciada.");
        chatInput?.focus();
      } else if (action === "history") {
        featurePanel.querySelector(".memory-manager")?.remove();
        featurePanel.querySelector(".tools-note")?.remove();
        app.classList.add("feature-mode");
        document.querySelector("#view-title").textContent = "Histórico";
        featureHeading.textContent = featureCopy.history[0];
        featureDescription.textContent = "Suas conversas ficam salvas apenas neste navegador. Toque em uma conversa para continuar.";
        featureState.textContent = "CONVERSAS SALVAS: " + chatSessions.length;
        renderConversationList();
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
        featurePanel.querySelector(".history-list")?.remove();
        featurePanel.querySelector(".memory-manager")?.remove();
        featurePanel.querySelector(".tools-note")?.remove();
        if (action === "memory") {
          featureState.textContent = "MEMÓRIAS SALVAS: " + userMemories.length;
          renderMemoryManager();
        } else if (action === "lab") {
          const toolsNote = document.createElement("p");
          toolsNote.className = "tools-note";
          toolsNote.style.marginTop = "16px";
          toolsNote.textContent = "Calculadora e data/hora funcionam localmente, sem enviar esses comandos ao Gemini quando reconhecidos.";
          featurePanel.appendChild(toolsNote);
        }
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
  const sessionsKey = "atlas-conversations-v1";
  let chatSessions = [];
  let activeSessionId = "";
  let chatHistory = [];

  const createSession = (title = "Nova conversa") => ({
    id: "atlas-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7),
    title,
    updatedAt: Date.now(),
    messages: []
  });
  const getActiveSession = () => chatSessions.find((session) => session.id === activeSessionId);
  const saveSessions = () => {
    try {
      window.localStorage.setItem(sessionsKey, JSON.stringify(chatSessions.slice(0, 30)));
      return true;
    } catch (_) {
      showMessage("Não foi possível salvar o histórico neste navegador.");
      return false;
    }
  };
  const saveChatHistory = () => {
    const active = getActiveSession();
    if (active) {
      active.messages = chatHistory.slice(-40);
      active.updatedAt = Date.now();
    }
    saveSessions();
    try { window.localStorage.setItem(historyKey, JSON.stringify(chatHistory.slice(-40))); } catch (_) {}
  };
  // Mostra somente a mensagem mais recente do usuário e a resposta mais recente.
  // O histórico completo continua guardado em chatHistory para dar contexto à IA.
  const renderChatHistory = () => {
    if (!chatLog) return;
    chatLog.replaceChildren();
    const visibleMessages = chatHistory.slice(-2);
    for (const message of visibleMessages) {
      const item = document.createElement("div");
      item.className = "chat-message " + message.who;
      item.textContent = message.text;
      chatLog.appendChild(item);
    }
    chatLog.scrollTop = chatLog.scrollHeight;
  };
  const switchConversation = (id) => {
    const target = chatSessions.find((session) => session.id === id);
    if (!target) return;
    activeSessionId = target.id;
    chatHistory = target.messages.slice(-40);
    renderChatHistory();
    saveSessions();
    document.querySelector(".app")?.classList.add("chat-mode");
    document.querySelector("#view-title").textContent = target.title;
    showMessage("Conversa aberta.");
    if (status) status.textContent = "Histórico carregado";
    chatInput?.focus();
  };
  const startNewConversation = () => {
    const session = createSession();
    chatSessions.unshift(session);
    chatSessions = chatSessions.slice(0, 30);
    activeSessionId = session.id;
    chatHistory = session.messages;
    renderChatHistory();
    saveSessions();
  };
  const renderConversationList = () => {
    if (!featurePanel) return;
    featurePanel.querySelector(".history-list")?.remove();
    const list = document.createElement("div");
    list.className = "history-list";
    list.style.cssText = "display:grid;gap:10px;margin-top:16px";
    if (!chatSessions.length) {
      const empty = document.createElement("p");
      empty.textContent = "Nenhuma conversa salva ainda. Comece uma nova conversa.";
      list.appendChild(empty);
    }
    chatSessions.slice().sort((a, b) => b.updatedAt - a.updatedAt).forEach((session) => {
      const button = document.createElement("button");
      button.type = "button";
      button.style.cssText = "text-align:left;padding:12px;border-radius:10px;border:1px solid rgba(0,190,255,.4);background:#06152c;color:#fff;cursor:pointer";
      const title = document.createElement("strong");
      title.textContent = session.title || "Conversa";
      const detail = document.createElement("small");
      detail.style.cssText = "display:block;margin-top:5px;color:#a9d8f7";
      detail.textContent = session.messages.length + " mensagens · " + new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(session.updatedAt));
      button.append(title, detail);
      button.addEventListener("click", () => switchConversation(session.id));
      list.appendChild(button);
    });
    const clearAll = document.createElement("button");
    clearAll.type = "button";
    clearAll.textContent = "Apagar todo o histórico";
    clearAll.style.cssText = "padding:10px;border-radius:10px;border:1px solid #b54a67;background:#391326;color:#fff;cursor:pointer";
    clearAll.addEventListener("click", () => {
      chatSessions = [];
      startNewConversation();
      chatHistory = [];
      renderChatHistory();
      saveChatHistory();
      featureState.textContent = "HISTÓRICO APAGADO";
      featureDescription.textContent = "O histórico anterior foi apagado deste navegador.";
      renderConversationList();
    });
    list.appendChild(clearAll);
    featurePanel.appendChild(list);
  };

  try {
    const savedSessions = JSON.parse(window.localStorage.getItem(sessionsKey) || "null");
    if (Array.isArray(savedSessions)) {
      chatSessions = savedSessions.filter((session) => session && typeof session.id === "string" && Array.isArray(session.messages))
        .map((session) => ({
          id: session.id,
          title: typeof session.title === "string" ? session.title.slice(0, 60) : "Conversa",
          updatedAt: Number(session.updatedAt) || Date.now(),
          messages: session.messages.filter((item) => item && (item.who === "user" || item.who === "atlas") && typeof item.text === "string").slice(-40)
        })).slice(0, 30);
    }
    if (!chatSessions.length) {
      const legacy = JSON.parse(window.localStorage.getItem(historyKey) || "[]");
      const first = createSession(legacy.length ? "Conversa anterior" : "Nova conversa");
      first.messages = Array.isArray(legacy) ? legacy.filter((item) => item && (item.who === "user" || item.who === "atlas") && typeof item.text === "string").slice(-40) : [];
      chatSessions = [first];
    }
  } catch (_) {
    chatSessions = [createSession()];
  }
  activeSessionId = chatSessions[0].id;
  chatHistory = chatSessions[0].messages.slice(-40);
  renderChatHistory();
  saveSessions();

  const addChatMessage = (text, who) => {
    chatHistory.push({ text, who });
    chatHistory = chatHistory.slice(-40);
    const active = getActiveSession();
    if (active && who === "user" && active.messages.length === 0) {
      active.title = text.slice(0, 42) + (text.length > 42 ? "…" : "");
    }
    renderChatHistory();
    saveChatHistory();
  };

  const API_URL = window.ATLAS_API_URL || "/api/chat";

  const getLocalToolAnswer = (rawText) => {
    const text = rawText.trim();
    const query = text.toLocaleLowerCase("pt-BR");
    if (/\b(que horas são|que horas sao|hora atual|horas são|horas sao)\b/.test(query)) {
      return "Agora são " + new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date()) + ".";
    }
    if (/\b(que dia é hoje|que dia e hoje|data de hoje|qual é a data|qual e a data)\b/.test(query)) {
      return "Hoje é " + new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(new Date()) + ".";
    }
    const calcMatch = text.match(/^(?:calcule|calcular|quanto é|quanto e|conta)\s+(.+)\??$/i);
    if (!calcMatch) return null;
    const expression = calcMatch[1].replace(/,/g, ".").replace(/[×]/g, "*").replace(/[÷]/g, "/").trim();
    if (!/^[\d\s.+*/()%-]+$/.test(expression) || !/[\d]/.test(expression)) {
      return "Não consegui interpretar essa conta. Use números e operadores +, -, *, / e parênteses.";
    }
    try {
      const tokens = expression.match(/\d+(?:\.\d+)?|[()+*/%-]/g) || [];
      if (tokens.join("") !== expression.replace(/\s/g, "")) return "A conta contém símbolos que não reconheço.";
      let pos = 0;
      const parsePrimary = () => {
        if (tokens[pos] === "+") { pos++; return parsePrimary(); }
        if (tokens[pos] === "-") { pos++; return -parsePrimary(); }
        if (tokens[pos] === "(") {
          pos++;
          const value = parseExpression();
          if (tokens[pos++] !== ")") throw new Error("parênteses");
          return value;
        }
        const token = tokens[pos++];
        if (!token || !/^\d+(?:\.\d+)?$/.test(token)) throw new Error("número");
        return Number(token);
      };
      const parseTerm = () => {
        let value = parsePrimary();
        while (["*", "/", "%"].includes(tokens[pos])) {
          const op = tokens[pos++], next = parsePrimary();
          if ((op === "/" || op === "%") && next === 0) throw new Error("zero");
          value = op === "*" ? value * next : op === "/" ? value / next : value % next;
        }
        return value;
      };
      const parseExpression = () => {
        let value = parseTerm();
        while (tokens[pos] === "+" || tokens[pos] === "-") {
          const op = tokens[pos++], next = parseTerm();
          value = op === "+" ? value + next : value - next;
        }
        return value;
      };
      const result = parseExpression();
      if (pos !== tokens.length || !Number.isFinite(result)) throw new Error("conta");
      return "O resultado é " + new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 8 }).format(result) + ".";
    } catch (_) { return "Não consegui resolver essa conta. Confira a expressão e tente novamente."; }
  };

  const sendDemoMessage = async (message) => {
    const localAnswer = getLocalToolAnswer(message);
    addChatMessage(message, "user");
    if (localAnswer !== null) {
      addChatMessage(localAnswer, "atlas");
      showMessage("Resposta calculada localmente.");
      if (status) status.textContent = "Ferramenta local concluída";
      if (chatInput) { chatInput.disabled = false; chatInput.focus(); }
      return localAnswer;
    }
    showMessage("Conectando ao Gemini…");
    if (status) status.textContent = "O ATLAS está começando a responder…";
    if (chatInput) chatInput.disabled = true;

    let streamedAnswer = "";
    let liveMessage = null;
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream"
        },
        body: JSON.stringify({ message, stream: true, memories: userMemories, history: chatHistory.slice(0, -1).slice(-12).map((item) => ({ role: item.who === "user" ? "user" : "model", text: item.text })) }),
        signal: AbortSignal.timeout(100_000)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Não foi possível obter uma resposta do Gemini.");
      }
      if (!response.body || !response.headers.get("content-type")?.includes("text/event-stream")) {
        const data = await response.json().catch(() => ({}));
        if (typeof data.answer === "string" && data.answer.trim()) {
          streamedAnswer = data.answer.trim();
        } else {
          throw new Error("O servidor não iniciou a resposta em tempo real.");
        }
      } else {
        liveMessage = document.createElement("div");
        liveMessage.className = "chat-message atlas";
        liveMessage.textContent = "";
        chatLog?.appendChild(liveMessage);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let pending = "";
        let finished = false;

        const handleEvent = (eventText) => {
          if (!eventText) return;
          try {
            const event = JSON.parse(eventText);
            if (typeof event.text === "string") {
              const isFirstChunk = streamedAnswer.length === 0;
              const shouldFollow = chatLog && (chatLog.scrollHeight - chatLog.scrollTop - chatLog.clientHeight < 80);
              streamedAnswer += event.text;
              if (liveMessage) liveMessage.textContent += event.text;
              if (chatLog && shouldFollow) chatLog.scrollTop = chatLog.scrollHeight;
              if (isFirstChunk) {
                showMessage("O ATLAS está escrevendo…");
                if (status) status.textContent = "Gerando resposta";
              }
            }
            if (event.error) throw new Error(event.error);
            if (event.done) finished = true;
          } catch (error) {
            if (error instanceof SyntaxError) return;
            throw error;
          }
        };

        while (!finished) {
          const { value, done } = await reader.read();
          pending += decoder.decode(value || new Uint8Array(), { stream: !done });
          const events = pending.split(/\r?\n\r?\n/);
          pending = events.pop() || "";
          for (const eventBlock of events) {
            const data = eventBlock.split(/\r?\n/)
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(5).trim())
              .join("\n");
            handleEvent(data);
          }
          if (done) break;
        }
        if (pending.trim()) {
          const data = pending.split(/\r?\n/)
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trim())
            .join("\n");
          handleEvent(data);
        }
        if (!finished) throw new Error("A transmissão foi encerrada antes de terminar.");
      }

      if (!streamedAnswer.trim()) throw new Error("O Gemini não retornou texto nesta resposta.");
      addChatMessage(streamedAnswer.trim(), "atlas");
      showMessage("Resposta recebida do Gemini.");
      if (status) status.textContent = "Gemini conectado";
      return streamedAnswer.trim();
    } catch (error) {
      const messageText = error && error.name === "TimeoutError"
        ? "O Gemini demorou demais para responder. Tente novamente."
        : (error && error.message || "").includes("Failed to fetch")
          ? "Não consegui acessar a IA. Se o site estiver publicado, confira o servidor e a variável GEMINI_API_KEY."
          : (error && error.message || "Não consegui conectar ao Gemini.");
      if (liveMessage) liveMessage.remove();
      const savedErrorText = streamedAnswer.trim()
        ? streamedAnswer.trim() + "\n\n⚠️ A conexão foi interrompida antes da resposta terminar. Tente novamente."
        : messageText;
      addChatMessage(savedErrorText, "atlas");
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
