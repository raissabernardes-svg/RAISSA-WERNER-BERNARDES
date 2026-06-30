import React, { useState, useEffect } from "react";
import { 
  Leaf, 
  MapPin, 
  Calculator, 
  ShieldAlert, 
  PlusCircle, 
  Download, 
  Trash2, 
  Edit2, 
  Check, 
  FileText, 
  AlertTriangle, 
  Search, 
  Award, 
  ShieldCheck, 
  LogOut,
  Droplet,
  BatteryCharging,
  Package,
  Cpu,
  Bookmark,
  RefreshCw,
  BookOpen,
  Camera,
  Upload,
  X,
  Image,
  Eye,
  EyeOff,
  Key,
  TrendingUp,
  Sparkles,
  Save
} from "lucide-react";
import { PontoColeta, Impactos, RotaSugerida, CalculoResultado } from "./types";

export default function App() {
  // Estado das Abas
  const [activeTab, setActiveTab] = useState<"calc" | "suggest" | "user" | "admin">("calc");
  const [localSearchHistory, setLocalSearchHistory] = useState<{ date: string; bairro: string; itemsCount: number }[]>([]);

  // --- ABA 1: CALCULADORA DE IMPACTO ---
  const [cep, setCep] = useState("");
  const [bairroResolvido, setBairroResolvido] = useState("");
  const [cepValido, setCepValido] = useState<boolean | null>(null);
  const [quantidades, setQuantidades] = useState({
    oleo: "",
    pilhas: "",
    blisters: "",
    lixoEletronico: "",
    lampadas: "",
  });
  const [resultado, setResultado] = useState<CalculoResultado | null>(null);
  const [calculando, setCalculando] = useState(false);

  // --- ABA 2: SUGERIR PONTO ---
  const [suggestion, setSuggestion] = useState({
    empresa: "",
    endereco: "",
    cep: "",
    bairro: "",
    tipo: "Óleo",
  });
  const [suggestSuccess, setSuggestSuccess] = useState(false);
  const [suggestError, setSuggestError] = useState("");
  const [suggestLoading, setSuggestLoading] = useState(false);

  // --- ABA 3: PAINEL ADMINISTRATIVO & USUÁRIO ---
  const [adminPassword, setAdminPassword] = useState("");
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminError, setAdminError] = useState("");
  const [pontos, setPontos] = useState<PontoColeta[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [loadingPanel, setLoadingPanel] = useState(false);

  // Filtros painel adm
  const [adminFilter, setAdminFilter] = useState<"all" | "approved" | "pending">("all");
  const [logFilter, setLogFilter] = useState("");

  // Formulário de Cadastro por Admin (Aprovado por padrão)
  const [newPoint, setNewPoint] = useState({
    empresa: "",
    endereco: "",
    cep: "",
    bairro: "",
    tipo: "Óleo",
  });
  const [newPointSuccess, setNewPointSuccess] = useState(false);

  // Ponto sendo editado (Modal de Edição)
  const [editingPoint, setEditingPoint] = useState<PontoColeta | null>(null);

  // --- CONFIRMAÇÃO DE ENTREGA COM FOTO ---
  const [deliveryModalPoint, setDeliveryModalPoint] = useState<any | null>(null);
  const [deliveryModalResiduo, setDeliveryModalResiduo] = useState<string>("");
  const [deliveryPhotoBase64, setDeliveryPhotoBase64] = useState<string>("");
  const [adminDeliveries, setAdminDeliveries] = useState<any[]>([]);

  // --- REPORTE DE PONTO INOPERANTE ---
  const [reportingPoint, setReportingPoint] = useState<any | null>(null);
  const [reportReason, setReportReason] = useState<string>("");
  const [adminReports, setAdminReports] = useState<any[]>([]);

  // --- ENCAMINHAR SUGESTÕES ---
  const [userSuggestionText, setUserSuggestionText] = useState("");
  const [suggestionSuccessMsg, setSuggestionSuccessMsg] = useState("");
  const [suggestionLoadingUser, setSuggestionLoadingUser] = useState(false);
  const [adminSuggestions, setAdminSuggestions] = useState<any[]>([]);

  // --- ENTREGAS CONFIRMADAS NO LOCAL (UX E RECOMPENSA) ---
  const [confirmedPoints, setConfirmedPoints] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationDetails, setCelebrationDetails] = useState<any | null>(null);

  // --- ÁREA DO USUÁRIO & MULTI-DEVICE CLOUD SYNC ---
  const [userName, setUserName] = useState("Eco Cidadão");
  const [userCourse, setUserCourse] = useState("Membro Protetor");
  const [userAvatar, setUserAvatar] = useState("🌱");
  const [userStats, setUserStats] = useState({
    aguaProtegida: 0,
    co2Evitado: 0,
    soloProtegido: 0,
    materiasRecuperadas: 0,
    mercurioIsolado: 0,
    feiraVerdeCredits: 0
  });
  const [userSavedSimulations, setUserSavedSimulations] = useState<any[]>([]);
  const [mySuggestionIds, setMySuggestionIds] = useState<number[]>([]);
  const [simulationSaved, setSimulationSaved] = useState(false);

  // Desafios de Sustentabilidade
  const [challenges, setChallenges] = useState({
    canecaRu: false,
    papaPilhas: false,
    primeiroCalculo: false,
    sugeriuPonto: false,
    ecoMultiplicador: false
  });

  // Credenciais para Login e Sincronização do Eco-Perfil
  const [userToken, setUserToken] = useState("");
  const [loggedUser, setLoggedUser] = useState<any>(null); // { username, email, displayName, regionalContext, avatar }
  
  const [authFormMode, setAuthFormMode] = useState<"login" | "register">("login");
  const [authUsername, setAuthUsername] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authDisplayName, setAuthDisplayName] = useState("");
  const [authRegionalContext, setAuthRegionalContext] = useState("Centro");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // States para visualização de senha e redefinição/recuperação via e-mail
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);
  const [recoveryInputKey, setRecoveryInputKey] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryUsername, setRecoveryUsername] = useState("");
  const [recoveryVerificationCode, setRecoveryVerificationCode] = useState("");
  const [recoveryNewPassword, setRecoveryNewPassword] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryDevCode, setRecoveryDevCode] = useState<string | null>(null);
  const [showDevCodeOption, setShowDevCodeOption] = useState(false);

  // Modal de confirmação customizado para contornar restrições de pop-ups em Iframe
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    isDanger: boolean;
    onConfirm: (() => void) | (() => Promise<void>) | null;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirmar",
    isDanger: false,
    onConfirm: null
  });

  const isAdmin = loggedUser && (
    loggedUser.username === "viverbio" || 
    loggedUser.email === "viverbio.pg@gmail.com"
  );

  // Sincronização em tempo real das alterações do perfil com o servidor persistente
  const syncUserDataOnServer = async (
    token: string,
    currentStats = userStats,
    currentChallenges = challenges,
    currentSimulations = userSavedSimulations,
    name = userName,
    region = userCourse,
    avatar = userAvatar
  ) => {
    if (!token) return;
    try {
      const res = await fetch("/api/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          stats: currentStats,
          challenges: currentChallenges,
          savedSimulations: currentSimulations,
          displayName: name,
          regionalContext: region,
          avatar
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setLoggedUser(data.user);
        setUserSavedSimulations(data.user.savedSimulations || []);
        setUserStats(data.user.stats);
        setChallenges(data.user.challenges);
        localStorage.setItem("eco_logged_user", JSON.stringify(data.user));
      }
    } catch (e) {
      console.error("Erro ao sincronizar dados com o servidor:", e);
    }
  };

  const handleUserLogout = () => {
    setUserToken("");
    setLoggedUser(null);
    localStorage.removeItem("eco_user_session_token");
    localStorage.removeItem("eco_logged_user");
    localStorage.removeItem("eco_user_history");
    localStorage.removeItem("eco_user_stats");
    localStorage.removeItem("eco_user_challenges");
    
    // Resetar para valores limpos
    setUserName("Cidadão");
    setUserCourse("Visitante");
    setUserAvatar("🌱");
    setUserStats({
      aguaProtegida: 0,
      co2Evitado: 0,
      soloProtegido: 0,
      materiasRecuperadas: 0,
      mercurioIsolado: 0,
      feiraVerdeCredits: 0
    });
    setChallenges({
      canecaRu: false,
      papaPilhas: false,
      primeiroCalculo: false,
      sugeriuPonto: false,
      ecoMultiplicador: false
    });
    setUserSavedSimulations([]);
  };

  const handleClearHistory = () => {
    setConfirmModal({
      isOpen: true,
      title: "Limpar Histórico de Simulações",
      message: "Deseja realmente limpar seu histórico pessoal de simulações e descartes? Essa ação não pode ser desfeita.",
      confirmText: "Sim, Limpar",
      isDanger: true,
      onConfirm: () => {
        setUserSavedSimulations([]);
        localStorage.setItem("eco_user_history", JSON.stringify([]));

        if (userToken && loggedUser) {
          const updatedUser = {
            ...loggedUser,
            savedSimulations: []
          };
          setLoggedUser(updatedUser);
          localStorage.setItem("eco_logged_user", JSON.stringify(updatedUser));
          syncUserDataOnServer(userToken, userStats, challenges, [], userName, userCourse, userAvatar);
        }
      }
    });
  };

  const handleDeletePersonalRecord = async (recordId: string) => {
    if (!recordId) return;
    setConfirmModal({
      isOpen: true,
      title: "Excluir Registro Pessoal",
      message: "Deseja realmente excluir este registro do seu histórico pessoal?",
      confirmText: "Excluir",
      isDanger: true,
      onConfirm: async () => {
        const updatedHistory = userSavedSimulations.filter(record => record.id !== recordId);
        setUserSavedSimulations(updatedHistory);
        localStorage.setItem("eco_user_history", JSON.stringify(updatedHistory));
        const finalStats = recalculateLocalStatsFromHistory(updatedHistory);

        // Se for entrega (pontoConfirmado), removemos do servidor/comunidade (tanto logged quanto offline)
        const targetRecord = userSavedSimulations.find(r => r.id === recordId);
        if (targetRecord?.pontoConfirmado) {
          try {
            await fetch(`/api/admin/deliveries/${recordId}`, { method: "DELETE" });
            fetchDeliveriesPublic(); // Atualiza contador e progresso do município!
          } catch (err) {
            console.error("Erro ao remover entrega do servidor:", err);
          }
        }

        if (userToken && loggedUser) {
          const updatedUser = {
            ...loggedUser,
            stats: finalStats,
            savedSimulations: updatedHistory
          };
          setLoggedUser(updatedUser);
          localStorage.setItem("eco_logged_user", JSON.stringify(updatedUser));
          syncUserDataOnServer(userToken, finalStats, challenges, updatedHistory, userName, userCourse, userAvatar);
        }
      }
    });
  };

  const handleRequestRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError("");
    setRecoverySuccess("");
    setRecoveryDevCode(null);
    setRecoveryLoading(true);

    try {
      const res = await fetch("/api/user/recover-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputKey: recoveryInputKey })
      });
      const data = await res.json();
      if (data.success) {
        setRecoverySuccess(data.message);
        setRecoveryEmail(data.email);
        setRecoveryUsername(data.username);
        if (data.simulated && data.devCode) {
          setRecoveryDevCode(data.devCode);
        }
        setRecoveryStep(2); // Avança pra verificação do código
      } else {
        setRecoveryError(data.error || "Houve um problema ao enviar o e-mail de recuperação.");
      }
    } catch (err) {
      console.error(err);
      setRecoveryError("Erro de rede ao conectar-se com a central de segurança.");
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleConfirmRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError("");
    setRecoverySuccess("");
    setRecoveryLoading(true);

    try {
      const res = await fetch("/api/user/recover-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: recoveryEmail,
          code: recoveryVerificationCode,
          newPassword: recoveryNewPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setRecoverySuccess(data.message);
        setRecoveryInputKey("");
        setRecoveryVerificationCode("");
        setRecoveryNewPassword("");
        setRecoveryDevCode(null);
        // Espera 4 segundos e volta para o fluxo de login normal
        setTimeout(() => {
          setRecoveryMode(false);
          setRecoveryStep(1);
          setRecoverySuccess("");
        }, 4000);
      } else {
        setRecoveryError(data.error || "Erro de verificação do código de redefinição.");
      }
    } catch (err) {
      console.error(err);
      setRecoveryError("Erro de rede ao submeter nova credencial de segurança.");
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleUserAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    const isReg = authFormMode === "register";
    const endpoint = isReg ? "/api/user/register" : "/api/user/login";
    const payload = isReg 
      ? {
          username: authUsername,
          email: authEmail,
          password: authPassword,
          displayName: authDisplayName || authUsername,
          regionalContext: authRegionalContext,
          avatar: "🌱"
        }
      : {
          username: authUsername, // username serves as 'username' or 'email' input
          password: authPassword
        };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setUserToken(data.token);
        setLoggedUser(data.user);
        
        // Persistir na sessão do navegador
        localStorage.setItem("eco_user_session_token", data.token);
        localStorage.setItem("eco_logged_user", JSON.stringify(data.user));

        // Aplicar dados de perfil resgatados do servidor
        setUserName(data.user.displayName);
        setUserCourse(data.user.regionalContext);
        setUserAvatar(data.user.avatar || "🌱");
        setChallenges(data.user.challenges);
        const loginHistoryList = data.user.savedSimulations || [];
        setUserSavedSimulations(loginHistoryList);
        recalculateLocalStatsFromHistory(loginHistoryList);

        setAuthUsername("");
        setAuthEmail("");
        setAuthPassword("");
        setAuthDisplayName("");

        // Se for o administrador Viver+Bio, carrega os dados de logística e logs
        const isUserAdmin = data.user.username === "viverbio" || data.user.email === "viverbio.pg@gmail.com";
        if (isUserAdmin) {
          fetchAdminData();
        }
      } else {
        setAuthError(data.error || "Lamentamos, verifique as informações e tente novamente.");
      }
    } catch (err) {
      console.error(err);
      setAuthError("Não foi possível conectar ao servidor de eco-perfis. Tente de novo.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Recalcular stats do usuário com base no histórico
  const recalculateLocalStatsFromHistory = (history: any[]) => {
    const stats = {
      aguaProtegida: 0,
      co2Evitado: 0,
      soloProtegido: 0,
      materiasRecuperadas: 0,
      mercurioIsolado: 0,
      feiraVerdeCredits: 0
    };
    if (Array.isArray(history)) {
      history.forEach(r => {
        stats.aguaProtegida += Number(r.agua) || 0;
        stats.co2Evitado += Number(r.co2) || 0;
        stats.soloProtegido += Number(r.solo) || 0;
        stats.materiasRecuperadas += Number(r.materias) || 0;
        stats.mercurioIsolado += Number(r.mercurio) || 0;
        stats.feiraVerdeCredits += Number(r.feiraVerde) || 0;
      });
    }
    setUserStats(stats);
    localStorage.setItem("eco_user_stats", JSON.stringify(stats));
    return stats;
  };

  const fetchDeliveriesPublic = async () => {
    try {
      const res = await fetch("/api/admin/deliveries");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.deliveries)) {
          setAdminDeliveries(data.deliveries);
        }
      }
    } catch (e) {
      console.error("Erro ao carregar entregas públicas:", e);
    }
  };

  // Efeitos iniciais
  useEffect(() => {
    // Sincronizar pontos de coleta de forma pública
    fetchPointsPublic();
    fetchDeliveriesPublic();

    // Carregar dados de perfil persistentes se autenticado
    const storedTokenUser = localStorage.getItem("eco_user_session_token");
    const storedLoggedUserObj = localStorage.getItem("eco_logged_user");

    if (storedTokenUser && storedLoggedUserObj) {
      try {
        const parsed = JSON.parse(storedLoggedUserObj);
        setUserToken(storedTokenUser);
        setLoggedUser(parsed);
        setUserName(parsed.displayName);
        setUserCourse(parsed.regionalContext);
        setUserAvatar(parsed.avatar || "🌱");
        setChallenges(parsed.challenges);
        const parsedHistoryList = parsed.savedSimulations || [];
        setUserSavedSimulations(parsedHistoryList);
        recalculateLocalStatsFromHistory(parsedHistoryList);

        // Se for o administrador Viver+Bio, carregar logs e postos pendentes
        const isUserAdmin = parsed.username === "viverbio" || parsed.email === "viverbio.pg@gmail.com";
        if (isUserAdmin) {
          fetchAdminData();
        }

        // Buscar dados mais recentes diretamente do servidor de forma assincrona e atualizar cache local
        fetch(`/api/user/me?token=${encodeURIComponent(storedTokenUser)}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.user) {
              setLoggedUser(data.user);
              setUserName(data.user.displayName);
              setUserCourse(data.user.regionalContext);
              setUserAvatar(data.user.avatar || "🌱");
              setChallenges(data.user.challenges);
              const serverHistoryList = data.user.savedSimulations || [];
              setUserSavedSimulations(serverHistoryList);
              recalculateLocalStatsFromHistory(serverHistoryList);
              localStorage.setItem("eco_logged_user", JSON.stringify(data.user));
              
              const freshAdmin = data.user.username === "viverbio" || data.user.email === "viverbio.pg@gmail.com";
              if (freshAdmin) {
                // Atualizar dados de administração também de forma automática
                fetchAdminData();
              }
            }
          })
          .catch(err => console.error("Erro ao validar atualizações de eco-perfil em background:", err));

      } catch (err) {
        console.error("Erro ao carregar sessão sincronizada do usuário:", err);
      }
    } else {
      // Carregar dados locais do localStorage em modo offline
      const cachedName = localStorage.getItem("eco_user_name");
      if (cachedName) setUserName(cachedName);
      else setUserName("Cidadão");

      const cachedCourse = localStorage.getItem("eco_user_course");
      if (cachedCourse) setUserCourse(cachedCourse);
      else setUserCourse("Visitante");

      const cachedAvatar = localStorage.getItem("eco_user_avatar");
      if (cachedAvatar) setUserAvatar(cachedAvatar);

      const cachedHistory = localStorage.getItem("eco_user_history");
      if (cachedHistory) {
        const cachedHistoryList = JSON.parse(cachedHistory);
        setUserSavedSimulations(cachedHistoryList);
        recalculateLocalStatsFromHistory(cachedHistoryList);
      } else {
        const cachedStats = localStorage.getItem("eco_user_stats");
        if (cachedStats) {
          setUserStats(JSON.parse(cachedStats));
        }
      }

      const cachedChallenges = localStorage.getItem("eco_user_challenges");
      if (cachedChallenges) {
        setChallenges(JSON.parse(cachedChallenges));
      }
    }

    const cachedSugs = localStorage.getItem("eco_my_suggestions");
    if (cachedSugs) {
      setMySuggestionIds(JSON.parse(cachedSugs));
    }

    try {
      const savedSearches = localStorage.getItem("eco_last_searches");
      if (savedSearches) {
        setLocalSearchHistory(JSON.parse(savedSearches));
      }
    } catch (err) {
      console.error("Erro ao carregar historico local das ultimas buscas:", err);
    }
  }, []);

  const fetchPointsPublic = async () => {
    try {
      const res = await fetch("/api/pontos");
      if (res.ok) {
        const data = await res.json();
        setPontos(data);
      }
    } catch (e) {
      console.error("Erro ao carregar pontos públicos:", e);
    }
  };

  // Confirmar entrega física fidedigna de um resíduo específico em um ponto de coleta mapeado
  const handleConfirmPointDelivery = async (point: any, residuo: string, photoBase64?: string) => {
    const pointId = `${point.empresa}-${point.cep}-${residuo}`;
    if (confirmedPoints.includes(pointId)) return;

    let qtyStr = "1";
    if (residuo === "Óleo") qtyStr = quantidades.oleo;
    else if (residuo === "Pilhas") qtyStr = quantidades.pilhas;
    else if (residuo === "Blisters") qtyStr = quantidades.blisters;
    else if (residuo === "Lixo Eletrônico") qtyStr = quantidades.lixoEletronico;
    else if (residuo === "Lâmpadas") qtyStr = quantidades.lampadas;

    const qty = parseFloat(qtyStr) || 1;

    // Calcular ganhos do impacto ecológico com base no item específico
    let ptAgua = 0;
    let ptCo2 = 0;
    let ptSolo = 0;
    let ptMaterias = 0;
    let ptMercurio = 0;
    let ptFeiraVerde = 0;

    if (residuo === "Óleo") {
      ptAgua = qty * 25000;
      ptFeiraVerde = Math.floor(qty / 2) || 1;
    } else if (residuo === "Pilhas") {
      ptSolo = qty * 15;
      ptFeiraVerde = Math.floor(qty / 5) || 1;
    } else if (residuo === "Blisters") {
      ptMaterias = qty * 10;
    } else if (residuo === "Lixo Eletrônico") {
      ptCo2 = qty * 2.5;
      ptFeiraVerde = Math.floor(qty) || 1;
    } else if (residuo === "Lâmpadas") {
      ptMercurio = qty * 5;
      ptFeiraVerde = Math.floor(qty / 3) || 1;
    }

    // Gravar no histórico de simulações do cidadão
    const newRecord = {
      id: "del-" + Date.now() + "-" + Math.floor(Math.random() * 1000000),
      date: new Date().toLocaleDateString("pt-BR"),
      bairro: point.bairro || "Geral",
      agua: ptAgua,
      co2: ptCo2,
      solo: ptSolo,
      materias: ptMaterias,
      mercurio: ptMercurio,
      feiraVerde: ptFeiraVerde,
      pontoConfirmado: point.empresa,
      residuo: residuo,
      qty: qty,
      foto: photoBase64 || null,
      tipoRegistro: "entrega"
    };

    const updatedHistory = [newRecord, ...userSavedSimulations];
    setUserSavedSimulations(updatedHistory);
    localStorage.setItem("eco_user_history", JSON.stringify(updatedHistory));
    const finalStats = recalculateLocalStatsFromHistory(updatedHistory);

    // Atualizar conquistas e desafios
    const updatedChallenges = { ...challenges };
    if (residuo === "Pilhas" && !challenges.papaPilhas) {
      updatedChallenges.papaPilhas = true;
    }

    const newConfirmedPoints = [...confirmedPoints, pointId];
    setConfirmedPoints(newConfirmedPoints);
    if (newConfirmedPoints.length >= 3 && !challenges.ecoMultiplicador) {
      updatedChallenges.ecoMultiplicador = true;
    }
    setChallenges(updatedChallenges);
    localStorage.setItem("eco_user_challenges", JSON.stringify(updatedChallenges));

    try {
      await fetch("/api/registrar-descarte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          userCourse,
          bairro: point.bairro || "Geral",
          pontoConfirmado: point.empresa,
          temFoto: !!photoBase64,
          quantidades: {
            oleo: residuo === "Óleo" ? qty : 0,
            pilhas: residuo === "Pilhas" ? qty : 0,
            blisters: residuo === "Blisters" ? qty : 0,
            lixoEletronico: residuo === "Lixo Eletrônico" ? qty : 0,
            lampadas: residuo === "Lâmpadas" ? qty : 0,
          },
          // Envias o record se o usuário for visitante (guest / não logado) para o servidor salvar no BD guest
          record: (!userToken || !loggedUser) ? newRecord : null
        })
      });
      fetchDeliveriesPublic(); // Sincroniza o volume coletivo do município!
    } catch (err) {
      console.error("Erro ao registrar entrega fidedigna de ponto:", err);
    }

    // Sincronizar na nuvem conectada
    if (userToken && loggedUser) {
      const updatedUser = {
        ...loggedUser,
        stats: finalStats,
        challenges: updatedChallenges,
        savedSimulations: updatedHistory
      };
      setLoggedUser(updatedUser);
      localStorage.setItem("eco_logged_user", JSON.stringify(updatedUser));
      syncUserDataOnServer(userToken, finalStats, updatedChallenges, updatedHistory, userName, userCourse, userAvatar);
    }

    setCelebrationDetails({
      empresa: point.empresa,
      residuo,
      bairro: point.bairro,
      quantidade: qty,
      ganhos: {
        agua: ptAgua,
        co2: ptCo2,
        solo: ptSolo,
        materias: ptMaterias,
        mercurio: ptMercurio,
        feiraVerde: ptFeiraVerde
      }
    });
    setShowCelebration(true);
    setDeliveryModalPoint(null);
  };

  // Função para salvar descarte no localStorage e no servidor (histórico de auditoria)
  const handleRegisterDescarte = async (impactItems: Impactos) => {
    // Chamar API no servidor primeiro para auditar a entrega real daquele usuário
    try {
      await fetch("/api/registrar-descarte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          userCourse,
          bairro: resultado?.bairroResolvido || "Geral",
          quantidades
        })
      });
    } catch (e) {
      console.error("Erro ao registrar entrega fidedigna no servidor:", e);
    }

    // Adiciona ao histórico do usuário
    const newRecord = {
      id: "sim-" + Date.now() + "-" + Math.floor(Math.random() * 1000000),
      date: new Date().toLocaleDateString("pt-BR"),
      bairro: resultado?.bairroResolvido || "Geral",
      agua: impactItems.aguaProtegida,
      co2: impactItems.co2EvitadoLixo,
      solo: impactItems.soloProtegido,
      materias: impactItems.plasticoRecuperado + impactItems.aluminioRecuperado + impactItems.metaisRecuperadosLixo,
      mercurio: impactItems.mercurioIsolado,
      feiraVerde: impactItems.feiraVerdeCredits,
      tipoRegistro: "simulacao"
    };

    const updatedHistory = [newRecord, ...userSavedSimulations];
    setUserSavedSimulations(updatedHistory);
    localStorage.setItem("eco_user_history", JSON.stringify(updatedHistory));
    const finalStats = recalculateLocalStatsFromHistory(updatedHistory);

    // Atualiza desafios
    const updatedChallenges = {
      ...challenges,
      primeiroCalculo: true
    };
    setChallenges(updatedChallenges);
    localStorage.setItem("eco_user_challenges", JSON.stringify(updatedChallenges));

    setSimulationSaved(true);

    // Se estiver conectado a uma conta persistente, envie a sincronização imediata à nuvem
    if (userToken && loggedUser) {
      const updatedUser = {
        ...loggedUser,
        stats: finalStats,
        challenges: updatedChallenges,
        savedSimulations: updatedHistory
      };
      setLoggedUser(updatedUser);
      localStorage.setItem("eco_logged_user", JSON.stringify(updatedUser));
      syncUserDataOnServer(userToken, finalStats, updatedChallenges, updatedHistory, userName, userCourse, userAvatar);
    }
  };

  // Atualizar campo de desafios de forma interativa
  const handleToggleChallenge = (key: keyof typeof challenges) => {
    const updated = {
      ...challenges,
      [key]: !challenges[key]
    };
    setChallenges(updated);
    localStorage.setItem("eco_user_challenges", JSON.stringify(updated));

    if (userToken && loggedUser) {
      const updatedUser = {
        ...loggedUser,
        challenges: updated
      };
      setLoggedUser(updatedUser);
      localStorage.setItem("eco_logged_user", JSON.stringify(updatedUser));
      syncUserDataOnServer(userToken, userStats, updated, userSavedSimulations, userName, userCourse, userAvatar);
    }
  };

  // Atualizar dados do perfil persistidos
  const handleSaveProfileField = (field: "name" | "course" | "avatar", value: string) => {
    let updatedName = userName;
    let updatedCourse = userCourse;
    let updatedAvatar = userAvatar;

    if (field === "name") {
      setUserName(value);
      updatedName = value;
      localStorage.setItem("eco_user_name", value);
    } else if (field === "course") {
      setUserCourse(value);
      updatedCourse = value;
      localStorage.setItem("eco_user_course", value);
    } else if (field === "avatar") {
      setUserAvatar(value);
      updatedAvatar = value;
      localStorage.setItem("eco_user_avatar", value);
    }

    if (userToken && loggedUser) {
      const updatedUser = {
        ...loggedUser,
        displayName: updatedName,
        regionalContext: updatedCourse,
        avatar: updatedAvatar
      };
      setLoggedUser(updatedUser);
      localStorage.setItem("eco_logged_user", JSON.stringify(updatedUser));
      syncUserDataOnServer(userToken, userStats, challenges, userSavedSimulations, updatedName, updatedCourse, updatedAvatar);
    }
  };

  // Monitorar input de CEP na Calculadora para autocompletar Bairro
  useEffect(() => {
    const cleaned = cep.trim().replace(/\D/g, "");
    if (cleaned.length === 8) {
      verificarCep(cleaned);
    } else {
      setBairroResolvido("");
      setCepValido(null);
    }
  }, [cep]);

  // Função para checar CEP local via API Express
  const verificarCep = async (cleanedCep: string) => {
    try {
      const response = await fetch(`/api/validar-cep/${cleanedCep}`);
      const data = await response.json();
      if (data.valido) {
        setBairroResolvido(data.bairro);
        setCepValido(true);
      } else {
        setBairroResolvido("");
        setCepValido(false);
      }
    } catch {
      setCepValido(false);
    }
  };

  const setQuantidade = (field: keyof typeof quantidades, val: string) => {
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setQuantidades(prev => ({ ...prev, [field]: val }));
      setSimulationSaved(false);
    }
  };

  // Calcular Impactos e Gerar Rotas Roteadas por Afunilamento
  const handleCalcular = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalculando(true);
    try {
      const response = await fetch("/api/calcular-impacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cep: cep,
          oleo: quantidades.oleo || "0",
          pilhas: quantidades.pilhas || "0",
          blisters: quantidades.blisters || "0",
          lixoEletronico: quantidades.lixoEletronico || "0",
          lampadas: quantidades.lampadas || "0",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResultado(data);

        // JavaScript puro para salvar as últimas 3 buscas diretamente no navegador do cliente (localStorage)
        try {
          const itemsList = [];
          if (parseFloat(quantidades.oleo) > 0) itemsList.push("Óleo");
          if (parseInt(quantidades.pilhas) > 0) itemsList.push("Pilhas");
          if (parseInt(quantidades.blisters) > 0) itemsList.push("Blisters");
          if (parseFloat(quantidades.lixoEletronico) > 0) itemsList.push("Lixo Eletrônico");
          if (parseInt(quantidades.lampadas) > 0) itemsList.push("Lâmpadas");
          
          if (itemsList.length > 0) {
            const timestamp = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
            const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
            const newSearch = {
              date: `${today} às ${timestamp}`,
              bairro: data.bairroResolvido || "Bairro Geral",
              itemsCount: itemsList.length
            };

            const currentHistoryStr = localStorage.getItem("eco_last_searches") || "[]";
            const currentHistory = JSON.parse(currentHistoryStr);
            
            // Adicionar mais novo ao início e limitar a 3 itens
            const updatedHistory = [newSearch, ...currentHistory].slice(0, 3);
            
            localStorage.setItem("eco_last_searches", JSON.stringify(updatedHistory));
            setLocalSearchHistory(updatedHistory);
          }
        } catch (storageErr) {
          console.error("Erro ao salvar busca localmente via localStorage:", storageErr);
        }
        // Scroll suave para os resultados no topo da seção calculada
        setTimeout(() => {
          const element = document.getElementById("resultado-top-container");
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          } else {
            window.scrollTo({ top: 350, behavior: "smooth" });
          }
        }, 100);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCalculando(false);
    }
  };

  // Enviar sugestão de ponto pelo cidadão
  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestLoading(true);
    setSuggestSuccess(false);
    setSuggestError("");

    if (!suggestion.empresa || !suggestion.endereco || !suggestion.cep || !suggestion.bairro) {
      setSuggestError("Por favor, preencha todos os campos.");
      setSuggestLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/pontos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...suggestion,
          aprovado: 0 // Pendente de liberação pelo admin
        }),
      });

      if (res.ok) {
        setSuggestSuccess(true);
        try {
          const data = await res.json();
          if (data.ponto && data.ponto.id) {
            const currentSugs = JSON.parse(localStorage.getItem("eco_my_suggestions") || "[]");
            currentSugs.push(data.ponto.id);
            localStorage.setItem("eco_my_suggestions", JSON.stringify(currentSugs));
            setMySuggestionIds(currentSugs);
          }
        } catch (e) {
          console.error("Erro ao salvar ID de sugestão de ponto localmente:", e);
        }

        // Marcar desafio concludio
        const updatedChallenges = {
          ...challenges,
          sugeriuPonto: true
        };
        setChallenges(updatedChallenges);
        localStorage.setItem("eco_user_challenges", JSON.stringify(updatedChallenges));

        setSuggestion({
          empresa: "",
          endereco: "",
          cep: "",
          bairro: "",
          tipo: "Óleo",
        });
      } else {
        setSuggestError("Erro no servidor ao enviar sugestão.");
      }
    } catch {
      setSuggestError("Falha na comunicação com o servidor.");
    } finally {
      setSuggestLoading(false);
    }
  };

  // Autocompletar bairro no formulário de sugestão ao digitar CEP
  const handleSuggestionCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSuggestion(prev => ({ ...prev, cep: val }));
    const cleaned = val.replace(/\D/g, "");
    if (cleaned.length === 8) {
      try {
        const response = await fetch(`/api/validar-cep/${cleaned}`);
        const data = await response.json();
        if (data.valido) {
          setSuggestion(prev => ({ ...prev, bairro: data.bairro }));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Autocompletar bairro no formulário do Admin ao digitar CEP
  const handleAdminNewCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewPoint(prev => ({ ...prev, cep: val }));
    const cleaned = val.replace(/\D/g, "");
    if (cleaned.length === 8) {
      try {
        const response = await fetch(`/api/validar-cep/${cleaned}`);
        const data = await response.json();
        if (data.valido) {
          setNewPoint(prev => ({ ...prev, bairro: data.bairro }));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Login Administrativo
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await res.json();
      if (data.auth) {
        setAdminToken(data.token);
        localStorage.setItem("eco_admin_token", data.token);
        fetchAdminData();
      } else {
        setAdminError(data.error || "Senha inválida.");
      }
    } catch {
      setAdminError("Erro ao autenticar.");
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    localStorage.removeItem("eco_admin_token");
    setPontos([]);
    setLogs([]);
  };

  // Buscar dados administrativos
  const fetchAdminData = async () => {
    setLoadingPanel(true);
    try {
      const resPontos = await fetch("/api/pontos");
      const dataPontos = await resPontos.json();
      setPontos(dataPontos);

      const resLogs = await fetch("/api/historico");
      const dataLogs = await resLogs.json();
      setLogs(dataLogs.logs || []);

      const resDelivs = await fetch("/api/admin/deliveries");
      const dataDelivs = await resDelivs.json();
      if (dataDelivs.success) {
        setAdminDeliveries(dataDelivs.deliveries || []);
      }

      const resReports = await fetch("/api/admin/reports");
      const dataReports = await resReports.json();
      if (dataReports.success) {
        setAdminReports(dataReports.reports || []);
      }

      const resSug = await fetch("/api/admin/sugestoes");
      const dataSug = await resSug.json();
      if (dataSug.success) {
        setAdminSuggestions(dataSug.suggestions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPanel(false);
    }
  };

  // Enviar reporte de problema em ponto de coleta pelo cidadão
  const handleSendReport = async (point: any, reason: string) => {
    if (!reason.trim()) return;
    try {
      const res = await fetch("/api/pontos/reportar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pointId: point.id,
          pointName: point.empresa,
          reporterLabel: userName && userName !== "Eco Cidadão" && userName !== "Viver+Bio Cidadão" ? `${userName} (${userCourse})` : "Cidadão Anônimo",
          description: reason.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Agradecemos o seu alerta! O administrador do Viver+Bio foi avisado e vai inspecionar as condições de funcionamento deste local.");
        setReportingPoint(null);
        setReportReason("");
        // Se formos admin, atualizar os relatórios imediatamente
        const isUserAdmin = loggedUser && (loggedUser.username === "viverbio" || loggedUser.email === "viverbio.pg@gmail.com");
        if (isUserAdmin || adminToken) {
          fetchAdminData();
        }
      } else {
        alert(data.error || "Ocorreu um erro ao enviar o seu alerta.");
      }
    } catch (err) {
      console.error("Erro ao reportar problema no ponto:", err);
      alert("Erro de conexão ao enviar o alerta.");
    }
  };

  // Enviar sugestão / feedback geral pelo cidadão
  const handleSendSuggestion = async () => {
    if (!userSuggestionText.trim()) return;
    setSuggestionLoadingUser(true);
    setSuggestionSuccessMsg("");
    try {
      const res = await fetch("/api/sugestoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: userName && userName !== "Eco Cidadão" ? userName : "Cidadão Visitante",
          senderCourse: userCourse && userCourse !== "Membro Protetor" ? userCourse : "Visitante Municipal",
          senderEmail: loggedUser ? loggedUser.email : "Não coletado (Sessão Anônima)",
          suggestionText: userSuggestionText.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuggestionSuccessMsg("Sua sugestão foi enviada com sucesso ao painel administrativo!");
        setUserSuggestionText("");
        setTimeout(() => setSuggestionSuccessMsg(""), 6000);
        // Se formos admin, re-carrega as sugestões de controle
        const isUserAdmin = loggedUser && (loggedUser.username === "viverbio" || loggedUser.email === "viverbio.pg@gmail.com");
        if (isUserAdmin || adminToken) {
          fetchAdminData();
        }
      } else {
        alert(data.error || "Ocorreu um erro ao enviar a sugestão.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao enviar sugestão.");
    } finally {
      setSuggestionLoadingUser(false);
    }
  };

  // Arquivar sugestão pelo administrador
  const handleArchiveSuggestion = async (suggestionId: string) => {
    try {
      const res = await fetch(`/api/admin/sugestoes/${suggestionId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        // Atualiza a lista
        setAdminSuggestions(prev => prev.filter(s => s.id !== suggestionId));
        // Recarrega logs para auditar o evento
        const resLogs = await fetch("/api/historico");
        const dataLogs = await resLogs.json();
        setLogs(dataLogs.logs || []);
      } else {
        alert(data.error || "Erro ao arquivar sugestão");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao arquivar sugestão.");
    }
  };

  // Resolver/Deletar reporte pelo administrador
  const handleResolveReport = async (reportId: string, action: "resolve" | "delete") => {
    const isResolve = action === "resolve";
    setConfirmModal({
      isOpen: true,
      title: isResolve ? "Resolver Alerta" : "Excluir Alerta",
      message: isResolve 
        ? "Gostaria de marcar este alerta como resolvido? Ele será arquivado."
        : "Tem certeza que deseja excluir permanentemente o registro deste alerta?",
      confirmText: isResolve ? "Marcar Resolvido" : "Excluir Permanentemente",
      isDanger: !isResolve,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/reports/${reportId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
          });
          const data = await res.json();
          if (data.success) {
            fetchAdminData();
          } else {
            alert(data.error || "Não foi possível remover o alerta.");
          }
        } catch (err) {
          console.error("Erro ao remover/resolver alerta:", err);
          alert("Erro de conexão ao resolver o alerta.");
        }
      }
    });
  };

  // Excluir entrega na central de admin
  const handleDeleteAdminDelivery = async (deliveryId: string) => {
    if (!deliveryId) return;
    setConfirmModal({
      isOpen: true,
      title: "Excluir Registro de Entrega",
      message: "Tem certeza que deseja excluir permanentemente o registro desta entrega? Isso também irá removê-la do histórico pessoal do usuário.",
      confirmText: "Sim, Excluir",
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/deliveries/${deliveryId}`, {
            method: "DELETE"
          });
          const data = await res.json();
          if (data.success) {
            fetchAdminData();
            fetchDeliveriesPublic();
          } else {
            alert(data.error || "Não foi possível excluir esta entrega.");
          }
        } catch (err) {
          console.error("Erro ao excluir entrega do banco:", err);
          alert("Erro de conexão ao remover o registro.");
        }
      }
    });
  };

  // Aprovar Ponto de Coleta
  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`/api/pontos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aprovado: 1 }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Excluir Ponto de Coleta
  const handleDelete = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Remover Ponto de Coleta",
      message: "Tem certeza que deseja remover permanentemente este ponto de coleta?",
      confirmText: "Sim, Remover",
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/pontos/${id}`, { method: "DELETE" });
          if (res.ok) {
            fetchAdminData();
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  // Criar Ponto pelo Administrador (Já aprovado)
  const handleAdminCreatePoint = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewPointSuccess(false);

    if (!newPoint.empresa || !newPoint.endereco || !newPoint.cep || !newPoint.bairro) {
      alert("Preencha todos os campos do novo ponto.");
      return;
    }

    try {
      const res = await fetch("/api/pontos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newPoint, aprovado: 1 }),
      });
      if (res.ok) {
        setNewPointSuccess(true);
        setNewPoint({
          empresa: "",
          endereco: "",
          cep: "",
          bairro: "",
          tipo: "Óleo",
        });
        fetchAdminData();
        setTimeout(() => setNewPointSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submeter Edição de Ponto
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPoint) return;

    try {
      const res = await fetch(`/api/pontos/${editingPoint.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPoint),
      });
      if (res.ok) {
        setEditingPoint(null);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtros aplicados sobre pontos cadastrados
  const filteredPoints = pontos.filter(p => {
    if (adminFilter === "approved") return p.aprovado === 1;
    if (adminFilter === "pending") return p.aprovado === 0;
    return true;
  });

  // Filtros sobre logs
  const filteredLogs = logs.filter(line => 
    line.toLowerCase().includes(logFilter.toLowerCase())
  );

  return (
    <div id="app-root-container" className="min-h-screen bg-natural-cream text-natural-wood font-sans flex flex-col selection:bg-natural-sage-100 selection:text-natural-sage-950">
      
      {/* HEADER PRINCIPAL */}
      <header id="app-header" className="bg-natural-sage-800 text-white shadow-md border-b-4 border-natural-sage-600">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-natural-sage-600 rounded-lg text-natural-sage-50 shadow-inner">
              <Leaf className="w-8 h-8 text-natural-cream animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-semibold tracking-tight">EcoRota+Impacto</h1>
              <p className="text-[11px] text-natural-sage-100 uppercase tracking-widest font-mono">
                Logística Reversa Integrada
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right text-xs text-natural-sage-100">
            <span className="bg-natural-sage-700/60 px-3.5 py-2 rounded-full inline-block font-mono border border-natural-sage-600">
              📍 Consulta Municipal de Resíduos
            </span>
          </div>
        </div>
      </header>

      {/* SELETOR DE ABAS */}
      <nav id="app-nav" className="bg-natural-card border-b border-natural-border sticky top-0 z-40 shadow-sm shadow-natural-stone/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-start space-x-1 sm:space-x-4 py-2 overflow-x-auto">
            
            <button
              id="tab-btn-calc"
              onClick={() => setActiveTab("calc")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all shrink-0 cursor-pointer ${
                activeTab === "calc"
                  ? "bg-natural-sage-100 text-natural-sage-950 shadow-xs border-l-4 border-natural-sage-600"
                  : "text-natural-stone hover:bg-natural-sage-50 hover:text-natural-sage-950"
              }`}
            >
              <Calculator className="w-4 h-4 text-natural-sage-600" />
              Calculadora e Rotas
            </button>

            <button
              id="tab-btn-suggest"
              onClick={() => setActiveTab("suggest")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all shrink-0 cursor-pointer ${
                activeTab === "suggest"
                  ? "bg-natural-sage-100 text-natural-sage-950 shadow-xs border-l-4 border-natural-sage-600"
                  : "text-natural-stone hover:bg-natural-sage-50 hover:text-natural-sage-950"
              }`}
            >
              <PlusCircle className="w-4 h-4 text-natural-sage-600" />
              Sugerir Ponto
            </button>

            <button
              id="tab-btn-user"
              onClick={() => setActiveTab("user")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all shrink-0 cursor-pointer ${
                activeTab === "user"
                  ? "bg-natural-sage-100 text-natural-sage-950 shadow-xs border-l-4 border-natural-sage-600"
                  : "text-natural-stone hover:bg-natural-sage-50 hover:text-natural-sage-950"
              }`}
            >
              <Award className="w-4 h-4 text-natural-terracotta-600" />
              Área do Usuário (Eco-Perfil)
            </button>

          </div>
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <main id="app-main-content" className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* ==================== ABA 1: CALCULADORA DE IMPACTO ==================== */}
        {activeTab === "calc" && (
          <div id="section-calc" className="space-y-8 animate-fadeIn">
            
            {/* Introdução Curta */}
            <div className="bg-gradient-to-r from-natural-sage-800 to-natural-sage-950 rounded-2xl p-6 text-white shadow-md border-l-4 border-natural-terracotta-600 animate-fadeIn">
              <h2 className="text-2xl font-serif font-semibold">Inicie sua Simulação Ecológica</h2>
              <p className="text-natural-sage-100 text-sm mt-1 max-w-3xl">
                Informe as quantidades de descarte de resíduos industriais e domésticos de sua residência ou empresa para mensurar o impacto benéfico direto gerado na bacia hidrográfica e solo do nosso município.
              </p>
            </div>

            {/* Mensagem Amigável com Histórico Local do Navegador via LocalStorage (JS Puro) */}
            {loggedUser && localSearchHistory.length > 0 && (
              <div className="bg-natural-sage-50 border border-natural-sage-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs animate-fadeIn text-left">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-natural-sage-950 flex items-center gap-2">
                    <Award className="w-5 h-5 text-natural-terracotta-600 shrink-0" />
                    Bem-vindo de volta! Suas últimas consultas ajudaram o meio ambiente. Quer registrar um novo descarte today?
                  </p>
                  <p className="text-xs text-natural-stone">
                    Estas foram as suas últimas 3 simulações registradas localmente neste navegador:
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 w-full md:w-auto shrink-0">
                  {localSearchHistory.map((search, idx) => (
                     <div key={idx} className="bg-white/80 border border-natural-sage-200 px-3 py-1.5 rounded-xl text-xs space-y-0.5 shadow-xs hover:border-natural-sage-400 transition-colors">
                       <p className="font-bold text-natural-wood font-mono text-[9px] tracking-wide uppercase">{search.date}</p>
                       <p className="text-natural-sage-955 font-semibold">{search.bairro.replace(" (Bairro Geral)", "")} — {search.itemsCount} resíduo{search.itemsCount === 1 ? "" : "s"}</p>
                     </div>
                  ))}
                </div>
              </div>
            )}

            {resultado && (
              <div id="resultado-top-container" className="space-y-8 animate-fadeIn mb-8 text-left">
                {/* 1. Header do Resultado */}
                <div className="bg-natural-sage-50 border border-natural-sage-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-natural-wood flex items-center gap-2">
                      <Sparkles className="text-natural-sage-600 w-5 h-5 animate-pulse" />
                      Análise de Logística Reversa Integrada
                    </h3>
                    <p className="text-xs text-natural-stone">
                      Cálculos de impacto ecológico e rotas inteligentes geradas para o bairro <strong className="text-natural-sage-950 font-bold">{resultado.bairroResolvido}</strong>.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRegisterDescarte(resultado.impactos)}
                      disabled={simulationSaved}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                        simulationSaved
                          ? "bg-natural-sage-100 text-natural-sage-700 border border-natural-sage-200 cursor-not-allowed"
                          : "bg-natural-sage-600 hover:bg-natural-sage-700 text-white"
                      }`}
                    >
                      <Save className="w-3.5 h-3.5" />
                      {simulationSaved ? "Salvo no Histórico" : "Gravar no Meu Histórico"}
                    </button>
                    <button
                      onClick={() => {
                        setResultado(null);
                        setSimulationSaved(false);
                      }}
                      className="px-4 py-2 bg-white hover:bg-natural-cream text-natural-stone border border-natural-border rounded-xl text-xs font-medium transition-colors cursor-pointer"
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                {/* 2. Grid de Impactos Ecológicos */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Água Protegida */}
                  {resultado.impactos.aguaProtegida > 0 && (
                    <div className="bg-natural-card p-4 rounded-xl border border-natural-border shadow-3xs hover:border-natural-sage-300 transition-colors">
                      <span className="text-[10px] text-natural-stone font-mono uppercase font-bold tracking-wider">Água Protegida</span>
                      <p className="text-2xl font-serif font-bold text-natural-sage-950 mt-1">
                        {resultado.impactos.aguaProtegida.toLocaleString("pt-BR")} L
                      </p>
                      <p className="text-[10px] text-natural-stone mt-1">Evita contaminação de recursos hídricos.</p>
                    </div>
                  )}

                  {/* CO2 Evitado */}
                  {resultado.impactos.co2EvitadoLixo > 0 && (
                    <div className="bg-natural-card p-4 rounded-xl border border-natural-border shadow-3xs hover:border-natural-sage-300 transition-colors">
                      <span className="text-[10px] text-natural-stone font-mono uppercase font-bold tracking-wider">CO₂ Evitado</span>
                      <p className="text-2xl font-serif font-bold text-natural-sage-950 mt-1">
                        {resultado.impactos.co2EvitadoLixo.toLocaleString("pt-BR")} kg
                      </p>
                      <p className="text-[10px] text-natural-stone mt-1">Gases de efeito estufa mitigados.</p>
                    </div>
                  )}

                  {/* Solo Protegido */}
                  {resultado.impactos.soloProtegido > 0 && (
                    <div className="bg-natural-card p-4 rounded-xl border border-natural-border shadow-3xs hover:border-natural-sage-300 transition-colors">
                      <span className="text-[10px] text-natural-stone font-mono uppercase font-bold tracking-wider">Solo Protegido</span>
                      <p className="text-2xl font-serif font-bold text-natural-sage-950 mt-1">
                        {resultado.impactos.soloProtegido.toLocaleString("pt-BR")} m²
                      </p>
                      <p className="text-[10px] text-natural-stone mt-1">Filtração de metais pesados contida.</p>
                    </div>
                  )}

                  {/* Mercúrio Isolar */}
                  {resultado.impactos.mercurioIsolado > 0 && (
                    <div className="bg-natural-card p-4 rounded-xl border border-natural-border shadow-3xs hover:border-natural-sage-300 transition-colors">
                      <span className="text-[10px] text-natural-stone font-mono uppercase font-bold tracking-wider">Mercúrio Retido</span>
                      <p className="text-2xl font-serif font-bold text-natural-sage-950 mt-1">
                        {resultado.impactos.mercurioIsolado.toLocaleString("pt-BR")} mg
                      </p>
                      <p className="text-[10px] text-natural-stone mt-1">Gás altamente nocivo mantido seguro.</p>
                    </div>
                  )}

                  {/* Materiais Recuperados (Blisters/Lixo Eletronico) */}
                  {(resultado.impactos.plasticoRecuperado + resultado.impactos.aluminioRecuperado + resultado.impactos.metaisRecuperadosLixo) > 0 && (
                    <div className="bg-natural-card p-4 rounded-xl border border-natural-border shadow-3xs hover:border-natural-sage-300 transition-colors col-span-2">
                      <span className="text-[10px] text-natural-stone font-mono uppercase font-bold tracking-wider">Materiais nobres recuperados</span>
                      <p className="text-sm font-bold text-natural-wood mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                        {resultado.impactos.plasticoRecuperado > 0 && <span>Plástico: <strong className="text-natural-sage-750 font-mono text-xs">{resultado.impactos.plasticoRecuperado.toFixed(1)}g</strong></span>}
                        {resultado.impactos.aluminioRecuperado > 0 && <span>Alumínio: <strong className="text-natural-sage-750 font-mono text-xs">{resultado.impactos.aluminioRecuperado.toFixed(1)}g</strong></span>}
                        {resultado.impactos.metaisRecuperadosLixo > 0 && <span>Metais Nobres: <strong className="text-natural-sage-750 font-mono text-xs">{resultado.impactos.metaisRecuperadosLixo.toFixed(1)}g</strong></span>}
                      </p>
                      <p className="text-[10px] text-natural-stone mt-1">Matéria-prima reinserida na economia circular local.</p>
                    </div>
                  )}

                  {/* Créditos Feira Verde */}
                  {resultado.impactos.feiraVerdeCredits > 0 && (
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-3xs text-left col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-emerald-800 font-mono uppercase font-bold tracking-wider">Estimação Feira Verde</span>
                      <p className="text-2xl font-serif font-bold text-emerald-950 mt-1">
                        {resultado.impactos.feiraVerdeCredits} {resultado.impactos.feiraVerdeCredits === 1 ? "Crédito" : "Créditos"}
                      </p>
                      <p className="text-[10px] text-emerald-800 mt-1">Permite troca por hortaliças frescas no programa municipal.</p>
                    </div>
                  )}
                </div>

                {/* 3. BARRA DE ITENS ENTREGUES ATÉ AGORA */}
                <div id="progresso-entregas-municipais" className="bg-natural-card p-6 rounded-2xl border border-natural-border shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5">
                    <div>
                      <h4 className="font-serif font-bold text-natural-wood text-base flex items-center gap-2">
                        <TrendingUp className="text-natural-sage-600 w-5 h-5 shrink-0" />
                        Comunidade: Volume Consolidado de Logística Reversa
                      </h4>
                      <p className="text-xs text-natural-stone">
                        Soma total do peso ou unidades de resíduos perigosos que a comunidade municipal já entregou e retirou do meio ambiente urbano.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-natural-sage-100 text-natural-sage-950 px-2.5 py-1 rounded-lg border border-natural-sage-200 uppercase tracking-wider">
                      {adminDeliveries.length} Entregas Registradas
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 pt-2">
                    {/* Óleo */}
                    {(() => {
                      const totalOleo = adminDeliveries
                        .filter(d => d.residuo === "Óleo")
                        .reduce((sum, d) => sum + (Number(d.qty) || Number(d.quantidades?.oleo) || 0), 0);
                      const pct = Math.min((totalOleo / 500) * 100, 100);
                      return (
                        <div className="space-y-1.5 text-xs text-left">
                          <div className="flex justify-between font-semibold text-natural-stone">
                            <span>🪔 Óleo Coletado</span>
                            <span className="font-mono font-bold text-natural-wood">{totalOleo.toFixed(1)} L</span>
                          </div>
                          <div className="w-full bg-natural-cream rounded-full h-2 overflow-hidden border border-natural-border/60">
                            <div className="bg-natural-sage-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                          </div>
                          <p className="text-[9px] text-natural-stone/80 text-right">Meta Cidade: 500L</p>
                        </div>
                      );
                    })()}

                    {/* Pilhas */}
                    {(() => {
                      const totalPilhas = adminDeliveries
                        .filter(d => d.residuo === "Pilhas")
                        .reduce((sum, d) => sum + (Number(d.qty) || Number(d.quantidades?.pilhas) || 0), 0);
                      const pct = Math.min((totalPilhas / 1000) * 100, 100);
                      return (
                        <div className="space-y-1.5 text-xs text-left">
                          <div className="flex justify-between font-semibold text-natural-stone">
                            <span>🔋 Pilhas Recolhidas</span>
                            <span className="font-mono font-bold text-natural-wood">{totalPilhas} un</span>
                          </div>
                          <div className="w-full bg-natural-cream rounded-full h-2 overflow-hidden border border-natural-border/60">
                            <div className="bg-natural-sage-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                          </div>
                          <p className="text-[9px] text-natural-stone/80 text-right">Meta Cidade: 1k un</p>
                        </div>
                      );
                    })()}

                    {/* Blisters */}
                    {(() => {
                      const totalBlisters = adminDeliveries
                        .filter(d => d.residuo === "Blisters")
                        .reduce((sum, d) => sum + (Number(d.qty) || Number(d.quantidades?.blisters) || 0), 0);
                      const pct = Math.min((totalBlisters / 800) * 100, 100);
                      return (
                        <div className="space-y-1.5 text-xs text-left">
                          <div className="flex justify-between font-semibold text-natural-stone">
                            <span>💊 Blisters Salvos</span>
                            <span className="font-mono font-bold text-natural-wood">{totalBlisters} un</span>
                          </div>
                          <div className="w-full bg-natural-cream rounded-full h-2 overflow-hidden border border-natural-border/60">
                            <div className="bg-natural-sage-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                          </div>
                          <p className="text-[9px] text-natural-stone/80 text-right">Meta Cidade: 800 un</p>
                        </div>
                      );
                    })()}

                    {/* Lixo Eletrônico */}
                    {(() => {
                      const totalLixo = adminDeliveries
                        .filter(d => d.residuo === "Lixo Eletrônico")
                        .reduce((sum, d) => sum + (Number(d.qty) || Number(d.quantidades?.lixoEletronico) || 0), 0);
                      const pct = Math.min((totalLixo / 300) * 100, 100);
                      return (
                        <div className="space-y-1.5 text-xs text-left">
                          <div className="flex justify-between font-semibold text-natural-stone">
                            <span>💻 Lixo Eletrônico</span>
                            <span className="font-mono font-bold text-natural-wood">{totalLixo.toFixed(1)} Kg</span>
                          </div>
                          <div className="w-full bg-natural-cream rounded-full h-2 overflow-hidden border border-natural-border/60">
                            <div className="bg-natural-sage-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                          </div>
                          <p className="text-[9px] text-natural-stone/80 text-right">Meta Cidade: 300 Kg</p>
                        </div>
                      );
                    })()}

                    {/* Lâmpadas */}
                    {(() => {
                      const totalLampadas = adminDeliveries
                        .filter(d => d.residuo === "Lâmpadas")
                        .reduce((sum, d) => sum + (Number(d.qty) || Number(d.quantidades?.lampadas) || 0), 0);
                      const pct = Math.min((totalLampadas / 200) * 100, 100);
                      return (
                        <div className="space-y-1.5 text-xs text-left">
                          <div className="flex justify-between font-semibold text-natural-stone">
                            <span>💡 Lâmpadas Retidas</span>
                            <span className="font-mono font-bold text-natural-wood">{totalLampadas} un</span>
                          </div>
                          <div className="w-full bg-natural-cream rounded-full h-2 overflow-hidden border border-natural-border/60">
                            <div className="bg-natural-sage-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                          </div>
                          <p className="text-[9px] text-natural-stone/80 text-right">Meta Cidade: 200 un</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* 4. Rotas de Logística Reversa Encontradas */}
                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-natural-wood text-lg border-b border-natural-border pb-1">
                    🔍 Rotas de Logística Reversa Recomendadas pelo Sistema
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resultado.rotasSugeridas && resultado.rotasSugeridas.map((rota, sIdx) => (
                      <div key={sIdx} className="bg-natural-card p-5 rounded-2xl border-2 border-natural-sage-100 hover:border-natural-sage-300 transition-colors shadow-xs flex flex-col justify-between space-y-4 text-left">
                        
                        {/* Tipo de resíduo pesquisado */}
                        <div className="flex justify-between items-center bg-natural-sage-50/70 p-2.5 rounded-xl border border-natural-sage-100">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-natural-sage-950 uppercase tracking-wider">
                            📦 Descarte de {rota.residuo}
                          </span>
                          <span className="text-[10px] font-mono font-semibold bg-natural-sage-200/65 px-2 py-0.5 rounded text-natural-sage-950">
                            {rota.nivelBusca}
                          </span>
                        </div>

                        {/* Pontos de descarte sugeridos */}
                        <div className="space-y-4 flex-1">
                          {rota.pontos && rota.pontos.length > 0 ? (
                            rota.pontos.map((ponto, pIdx) => {
                              const uniqueId = `${ponto.empresa}-${ponto.cep}-${rota.residuo}`;
                              const isAlreadyDelivered = confirmedPoints.includes(uniqueId);
                              return (
                                <div key={pIdx} className="space-y-2 border-b border-natural-border/50 pb-3 last:border-b-0 last:pb-0">
                                  <div>
                                    <h5 className="font-bold text-natural-wood text-sm">{ponto.empresa}</h5>
                                    <p className="text-xs text-natural-stone font-medium">📍 {ponto.endereco} — Bairro: {ponto.bairro} (CEP {ponto.cep})</p>
                                  </div>
                                  
                                  {ponto.direcoesTexto && (
                                    <div className="bg-natural-cream/40 p-2.5 rounded-xl border border-natural-border/70 text-[11px] leading-relaxed text-natural-stone font-mono">
                                      🗺️ {ponto.direcoesTexto}
                                    </div>
                                  )}

                                  <div className="pt-1 flex flex-wrap gap-2 justify-between items-center">
                                    <span className="text-[10px] text-natural-sand font-mono uppercase tracking-wide">Ponto verificado e ativo</span>
                                    
                                    <button
                                      onClick={() => {
                                        setDeliveryModalPoint(ponto);
                                        setDeliveryModalResiduo(rota.residuo);
                                        setDeliveryPhotoBase64("");
                                      }}
                                      disabled={isAlreadyDelivered}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                        isAlreadyDelivered
                                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-not-allowed"
                                          : "bg-natural-sage-600 hover:bg-natural-sage-700 text-white shadow-xs"
                                      }`}
                                    >
                                      {isAlreadyDelivered ? "✓ Entrega Confirmada" : "Registrar Entrega de Resíduo"}
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-xs text-natural-stone font-mono italic">Nenhum ponto registrado no banco de dados para este item.</p>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Formulário de Quantidades */}
              <div className={resultado ? "lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-left" : "lg:col-span-12 space-y-6 text-left"}>
                <div className="bg-natural-card p-6 rounded-2xl border border-natural-border shadow-sm flex flex-col justify-between">
                <form onSubmit={handleCalcular} className="space-y-5">
                  <div className="border-b border-natural-border pb-3">
                    <h3 className="font-serif font-semibold text-natural-wood flex items-center gap-2 text-lg">
                      <Calculator className="text-natural-sage-600 w-5 h-5" />
                      1. Quantidade de Resíduos acumulados
                    </h3>
                    <p className="text-xs text-natural-stone">Insira valores numéricos para o cálculo ecológico.</p>
                  </div>

                  {/* Óleo */}
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-natural-stone flex justify-between items-center">
                      <span className="flex items-center gap-2"><Droplet className="w-4 h-4 text-natural-sage-600" /> Óleo Vegetal</span>
                      <span className="text-xs text-natural-style font-mono">Litros (L)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 5"
                      value={quantidades.oleo}
                      onChange={e => setQuantidade("oleo", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage-600/15 focus:border-natural-sage-600 text-sm bg-natural-cream/30 text-natural-wood font-medium"
                    />
                  </div>

                  {/* Pilhas */}
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-natural-stone flex justify-between items-center">
                      <span className="flex items-center gap-2"><BatteryCharging className="w-4 h-4 text-natural-sage-600" /> Pilhas Usadas</span>
                      <span className="text-xs text-natural-style font-mono">Unidades (un)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 12"
                      value={quantidades.pilhas}
                      onChange={e => setQuantidade("pilhas", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage-600/15 focus:border-natural-sage-600 text-sm bg-natural-cream/30 text-natural-wood font-medium"
                    />
                  </div>

                  {/* Blisters */}
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-natural-stone flex justify-between items-center">
                      <span className="flex items-center gap-2"><Bookmark className="w-4 h-4 text-natural-sage-600" /> Cartelas de Remédios (Blisters)</span>
                      <span className="text-xs text-natural-style font-mono">Unidades (un)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 30"
                      value={quantidades.blisters}
                      onChange={e => setQuantidade("blisters", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage-600/15 focus:border-natural-sage-600 text-sm bg-natural-cream/30 text-natural-wood font-medium"
                    />
                  </div>

                  {/* Lixo Eletrônico */}
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-natural-stone flex justify-between items-center">
                      <span className="flex items-center gap-2"><Cpu className="w-4 h-4 text-natural-sage-600" /> Lixo Eletrônico (teclados, cabos, aparelhos)</span>
                      <span className="text-xs text-natural-style font-mono">Quilogramas (Kg)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 2.5"
                      value={quantidades.lixoEletronico}
                      onChange={e => setQuantidade("lixoEletronico", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage-600/15 focus:border-natural-sage-600 text-sm bg-natural-cream/30 text-natural-wood font-medium"
                    />
                  </div>

                  {/* Lâmpadas */}
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-natural-stone flex justify-between items-center">
                      <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 text-natural-sage-600" /> Lâmpadas Fluorescentes</span>
                      <span className="text-xs text-natural-style font-mono">Unidades (un)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 4"
                      value={quantidades.lampadas}
                      onChange={e => setQuantidade("lampadas", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage-600/15 focus:border-natural-sage-600 text-sm bg-natural-cream/30 text-natural-wood font-medium"
                    />
                  </div>

                  {/* CEP Input e Validação Real-time */}
                  <div className="space-y-1 border-t border-natural-border pt-3">
                    <label className="text-sm font-semibold text-natural-wood flex justify-between items-center">
                      <span className="flex items-center gap-2">📍 Seu CEP Residencial</span>
                      <span className="text-xs text-natural-stone font-mono">84000-000 a 84099-999</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Digite o CEP (Ex: 84031-000)"
                        value={cep}
                        onChange={e => setCep(e.target.value)}
                        maxLength={9}
                        className="w-full px-3.5 py-2 rounded-lg border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage-600/15 focus:border-natural-sage-600 text-sm bg-natural-cream/30 text-natural-wood pr-10 font-mono font-medium"
                      />
                      <div className="absolute right-3 top-2.5">
                        {cepValido === true && <Check className="w-5 h-5 text-natural-sage-600 animate-bounce" />}
                        {cepValido === false && <AlertTriangle className="w-5 h-5 text-natural-terracotta-600 animate-pulse" />}
                        {cepValido === null && <Search className="w-5 h-5 text-natural-sand" />}
                      </div>
                    </div>
                    {bairroResolvido ? (
                      <div className="text-xs bg-natural-sage-50 text-natural-sage-800 p-2.5 rounded border border-natural-sage-100 font-medium">
                        Bairro identificado: <strong className="underline">{bairroResolvido}</strong> (Validação local ativa)
                      </div>
                    ) : cep.replace(/\D/g, "").length === 8 ? (
                      <div className="text-xs text-natural-terracotta-700 bg-natural-terracotta-50 p-2.5 rounded border border-natural-terracotta-100 font-medium">
                        Bairro não cadastrado em cache. Usará aproximação da região urbana geral.
                      </div>
                    ) : null}
                  </div>

                  <button
                    id="submit-btn-calc"
                    type="submit"
                    disabled={calculando}
                    className="w-full bg-natural-sage-600 hover:bg-natural-sage-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-colors text-sm cursor-pointer disabled:opacity-50"
                  >
                    {calculando ? "Roteando Logística..." : "Calcular Impacto e Buscar Rotas"}
                  </button>
                </form>
              </div>

              {/* Card Coletivo: Você Sabia? - Guia Ecológico (Ponto 4) */}
              <div id="guia-ecologico-didatico" className="bg-natural-card p-6 rounded-2xl border border-natural-border shadow-sm space-y-4">
                <div className="border-b border-natural-border pb-2.5">
                  <h4 className="font-serif font-semibold text-natural-wood text-base flex items-center gap-2">
                    <BookOpen className="text-natural-sage-600 w-5 h-5 shrink-0" />
                    Você Sabia? — Guia Ecológico
                  </h4>
                  <p className="text-[11px] text-natural-stone">
                    Entenda o perigo real do descarte incorreto de cada resíduo e a relevância científica do seu ato ecológico.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {/* Óleo */}
                  <div className="p-3 bg-natural-sage-50/40 rounded-xl border border-natural-sage-100 flex gap-3 text-xs leading-relaxed text-left">
                    <Droplet className="w-5 h-5 text-natural-sage-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-natural-sage-955 mb-0.5">Óleo Vegetal de Cozinha</h5>
                      <p className="text-natural-stone text-[11px] leading-snug">
                        Cada litro de óleo descartado de forma incorreta pode contaminar até 25.000 litros de água pura, formando películas insolúveis que bloqueiam a oxigenação biológica de rios e mananciais locais.
                      </p>
                    </div>
                  </div>

                  {/* Pilhas */}
                  <div className="p-3 bg-natural-sage-50/40 rounded-xl border border-natural-sage-100 flex gap-3 text-xs leading-relaxed text-left">
                    <BatteryCharging className="w-5 h-5 text-natural-sage-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-natural-sage-955 mb-0.5">Pilhas de Célula de Lítio e Zinco</h5>
                      <p className="text-natural-stone text-[11px] leading-snug">
                        Seus metais pesados são altamente poluentes. Estima-se que uma única pilha contamina cerca de 50 m² de solo fértil e lençóis subterrâneos por dezenas de anos.
                      </p>
                    </div>
                  </div>

                  {/* Blisters */}
                  <div className="p-3 bg-natural-sage-50/40 rounded-xl border border-natural-sage-100 flex gap-3 text-xs leading-relaxed text-left">
                    <Bookmark className="w-5 h-5 text-natural-sage-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-natural-sage-955 mb-0.5">Cartelas de Remédio (Blisters)</h5>
                      <p className="text-natural-stone text-[11px] leading-snug">
                        As cartelas unem plásticos complexos a alumínio de alto custo de extração. Sua descontaminação e reciclagem evitam a dispersão química de microrresíduos e fármacos na rede urbana.
                      </p>
                    </div>
                  </div>

                  {/* Lixo Eletrônico */}
                  <div className="p-3 bg-natural-sage-50/40 rounded-xl border border-natural-sage-150 flex gap-3 text-xs leading-relaxed text-left">
                    <Cpu className="w-5 h-5 text-natural-sage-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-natural-sage-955 mb-0.5">Lixo Eletrônico (E-Waste)</h5>
                      <p className="text-natural-stone text-[11px] leading-snug">
                        Aparelhos obsoletos contêm retardantes químicos inflamáveis e metais nobres escassos. A reciclagem industrial correta recupera ouro e prata, evitando novas minerações ecocidas.
                      </p>
                    </div>
                  </div>

                  {/* Lâmpadas */}
                  <div className="p-3 bg-natural-sage-50/40 rounded-xl border border-natural-sage-100 flex gap-3 text-xs leading-relaxed text-left">
                    <RefreshCw className="w-5 h-5 text-natural-sage-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-natural-sage-955 mb-0.5">Lâmpadas Fluorescentes</h5>
                      <p className="text-natural-stone text-[11px] leading-snug">
                        O mercúrio gasoso contido em cada filamento fluorescente tem altíssima volatilidade. Descartá-la inteira em galpões de coleta homologados preserva o ar e lençóis freáticos limpos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Se inativo, exibe placeholder na lateral */}
            {!resultado && (
              <div className="lg:col-span-12 space-y-6 text-left">
                <div className="bg-natural-card border-2 border-dashed border-natural-border rounded-2xl p-12 text-center h-full flex flex-col justify-center items-center">
                  <div className="p-4 bg-natural-cream rounded-full text-natural-sand mb-4">
                    <Calculator className="w-12 h-12 text-natural-sage-600" />
                  </div>
                  <h4 className="text-lg font-serif font-semibold text-natural-wood text-center">Cálculo Ecológico Inativo</h4>
                  <p className="text-xs text-natural-stone max-w-sm mt-1 text-center">
                    Preencha o formulário acima e clique em calcular para processar a logística reversa inteligente.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

        {/* ==================== ABA 2: SUGERIR PONTO ==================== */}
        {activeTab === "suggest" && (
          <div id="section-suggest" className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Coluna Esquerda: Formulário de Inclusão */}
              <div className="lg:col-span-7 bg-natural-card p-6 sm:p-8 rounded-2xl border border-natural-border shadow-sm space-y-6">
                <div className="border-b border-natural-border pb-4">
                  <h2 className="text-2xl font-serif font-semibold text-natural-wood flex items-center gap-2">
                    <PlusCircle className="text-natural-sage-600 w-7 h-7 shrink-0" />
                    Sugerir Ponto de Coleta Reversa
                  </h2>
                  <p className="text-natural-stone text-sm mt-1 text-left">
                    Se você conhece um ponto comercial, farmácia ou órgão público que coleta resíduos recicláveis, envie para nossa análise e inclua no mapa municipal de descarte.
                  </p>
                </div>

                {suggestSuccess && (
                  <div className="bg-natural-sage-50 border border-natural-sage-200 text-natural-sage-955 text-sm p-4 rounded-xl flex items-start gap-3 shadow-xs text-left">
                    <Check className="w-5 h-5 text-natural-sage-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Inclusão Proposta com Sucesso!</strong>
                      Sua sugestão de ponto de descarte foi salva no banco de dados local com estado <span className="underline font-bold">Pendente</span>. O administrador irá avaliá-la e liberá-la para as pesquisas de rotas gerais.
                    </div>
                  </div>
                )}

                {suggestError && (
                  <div className="bg-natural-terracotta-50 border border-natural-terracotta-200 text-natural-terracotta-800 text-sm p-4 rounded-xl flex items-start gap-3 shadow-xs text-left">
                    <AlertTriangle className="w-5 h-5 text-natural-terracotta-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Erro ao salvar proposta</strong>
                      {suggestError}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSuggest} className="space-y-4">
                  
                  {/* Nome do Local / Empresa */}
                  <div className="space-y-1 text-left">
                    <label className="text-sm font-semibold text-natural-stone">Nome do Ponto de Coleta / Empresa</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Farmácia Popular de Uvaranas"
                      value={suggestion.empresa}
                      onChange={e => setSuggestion(prev => ({ ...prev, empresa: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage-600/15 focus:border-natural-sage-600 text-sm bg-natural-cream/30 text-natural-wood font-medium"
                    />
                  </div>

                  {/* Tipo de Resíduo Coletado */}
                  <div className="space-y-1 text-left">
                    <label className="text-sm font-semibold text-natural-stone">Tipo de Resíduo Coletado no Local</label>
                    <select
                      value={suggestion.tipo}
                      onChange={e => setSuggestion(prev => ({ ...prev, tipo: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage-600/15 focus:border-natural-sage-600 text-sm bg-natural-cream/40 text-natural-wood font-medium cursor-pointer"
                    >
                      <option value="Óleo">Óleo (Litros)</option>
                      <option value="Pilhas">Pilhas (Unid)</option>
                      <option value="Blisters">Blisters (Unid)</option>
                      <option value="Lixo Eletrônico">Lixo Eletrônico (Kg)</option>
                      <option value="Lâmpadas">Lâmpadas (Unid)</option>
                    </select>
                  </div>

                  {/* CEP com autonivelamento */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-natural-stone font-mono">CEP</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 84031-000"
                        value={suggestion.cep}
                        onChange={handleSuggestionCepChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage-600/15 focus:border-natural-sage-600 text-sm bg-natural-cream/30 text-natural-wood font-medium font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-natural-stone">Bairro (Autocompletado pelo CEP)</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Uvaranas"
                        value={suggestion.bairro}
                        onChange={e => setSuggestion(prev => ({ ...prev, bairro: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-lg border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage-600/15 focus:border-natural-sage-600 text-sm bg-natural-cream/30 text-natural-wood font-medium"
                      />
                    </div>
                  </div>

                  {/* Endereço Completo */}
                  <div className="space-y-1 text-left">
                    <label className="text-sm font-semibold text-natural-stone">Endereço Completo (Rua, Número, Referência)</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Av. Dom Geraldo Pellanda, 1420 - ao lado da igreja"
                      value={suggestion.endereco}
                      onChange={e => setSuggestion(prev => ({ ...prev, endereco: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage-600/15 focus:border-natural-sage-600 text-sm bg-natural-cream/30 text-natural-wood font-medium"
                    />
                  </div>

                  <button
                    id="submit-btn-suggest"
                    type="submit"
                    disabled={suggestLoading}
                    className="w-full bg-natural-sage-600 hover:bg-natural-sage-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-colors text-sm cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {suggestLoading ? "Salvando Proposta..." : "Enviar Sugestão para Aprovação"}
                  </button>
                </form>
              </div>

              {/* Coluna Direita: Base de Dados Cartográfica CEPs */}
              <div className="lg:col-span-5 bg-natural-card p-6 sm:p-8 rounded-2xl border border-natural-border shadow-sm space-y-4 text-left">
                <div>
                  <h3 className="font-serif font-semibold text-natural-wood text-lg flex items-center gap-2">
                    <span>🗺️ Base Cartográfica Oficial</span>
                  </h3>
                  <p className="text-xs text-natural-stone font-medium">
                    Códigos Postais (CEPs) por Bairros do Município, vigentes para validação de fluxos ambientais:
                  </p>
                </div>

                <div className="border border-natural-border/60 rounded-xl overflow-hidden bg-white/40">
                  <div className="bg-natural-cream/30 px-3.5 py-2.5 text-[11px] font-mono font-bold text-natural-wood border-b border-natural-border/60 grid grid-cols-12 gap-2 uppercase tracking-tight">
                    <div className="col-span-6">Bairro</div>
                    <div className="col-span-3 text-center">CEP Inicial</div>
                    <div className="col-span-3 text-center">CEP Final</div>
                  </div>
                  
                  <div className="max-h-[385px] overflow-y-auto divide-y divide-natural-border/40 text-[11px] font-medium text-natural-wood">
                    {[
                      { b: "Área Rural", start: "84099-899", end: "84099-899" },
                      { b: "Boa Vista", start: "84070-040", end: "84073-905" },
                      { b: "Cará-cará", start: "84026-383", end: "84045-018" },
                      { b: "Centro", start: "84001-970", end: "84126-970" },
                      { b: "Chapada", start: "84062-000", end: "84064-615" },
                      { b: "Colônia Dona Luíza", start: "84043-000", end: "84047-042" },
                      { b: "Contorno", start: "84052-000", end: "84062-610" },
                      { b: "Estrela", start: "84040-000", end: "84050-915" },
                      { b: "Guaragi", start: "84120-970", end: "84120-970" },
                      { b: "Jardim Carvalho", start: "84015-150", end: "84020-155" },
                      { b: "Neves", start: "84020-040", end: "84030-758" },
                      { b: "Nova Rússia", start: "84010-430", end: "84071-981" },
                      { b: "Oficinas", start: "84035-310", end: "84045-981" },
                      { b: "Olarias", start: "84026-280", end: "84035-970" },
                      { b: "Orfãs", start: "84010-650", end: "84070-280" },
                      { b: "Piriquitos", start: "84064-006", end: "84065-890" },
                      { b: "Ronda", start: "84010-700", end: "84059-490" },
                      { b: "Uvaranas", start: "84020-000", end: "84033-260" }
                    ].map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`grid grid-cols-12 gap-2 px-3.5 py-2.5 items-center hover:bg-natural-sage-50/20 transition-colors ${
                          idx % 2 === 0 ? "bg-white/10" : ""
                        }`}
                      >
                        <div className="col-span-6 font-bold">{item.b}</div>
                        <div className="col-span-3 text-center font-mono text-xs text-natural-wood bg-natural-cream/35 py-0.5 rounded border border-natural-border/30">{item.start}</div>
                        <div className="col-span-3 text-center font-mono text-xs text-natural-wood bg-natural-cream/35 py-0.5 rounded border border-natural-border/30">{item.end}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-natural-sage-50 border border-natural-sage-100 p-3.5 rounded-xl text-[11px] text-natural-sage-955 leading-relaxed font-medium">
                  💡 <strong>Dica de Validação:</strong> Ao digitar o CEP no formulário esquerdo, nossa inteligência local mapeia automaticamente os limites físicos definidos sob a faixa de <strong>84000-001 a 84129-999</strong> do município operacional.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== ABA 3: ÁREA DO USUÁRIO (ECO-PERFIL) ==================== */}
        {activeTab === "user" && (
          <div id="section-user" className="space-y-8 animate-fadeIn">
            
            {!userToken ? (
              // FORMULÁRIO DE AUTENTICAÇÃO (LOGIN OU CADASTRO VIVER+BIO)
              <div className="max-w-md mx-auto bg-natural-card p-8 rounded-2xl border border-natural-border shadow-sm space-y-6">
                {recoveryMode ? (
                  // FORMULÁRIO DE RECUPERAÇÃO DE CONTA EM DOIS PASSOS VIA E-MAIL
                  <div className="space-y-4 animate-fadeIn">
                    <div className="text-center space-y-1.5">
                      <div className="w-10 h-10 bg-natural-sage-50 text-natural-sage-955 rounded-full flex items-center justify-center mx-auto mb-2 border border-natural-sage-100 animate-bounce">
                        <Key className="w-5 h-5 text-natural-sage-600" />
                      </div>
                      <h3 className="font-serif font-semibold text-natural-wood text-lg">
                        {recoveryStep === 1 ? "Recuperar Eco-Perfil via E-mail" : "Redefinir Senha do Eco-Perfil"}
                      </h3>
                      <p className="text-natural-stone text-xs max-w-xs mx-auto">
                        {recoveryStep === 1 
                          ? "Informe seu Usuário ou e-mail cadastrado para enviarmos seu código temporário de verificação."
                          : "Digite o código gerado pelo sistema e informe a nova senha de login da conta."}
                      </p>
                    </div>

                    {recoveryError && (
                      <div className="bg-natural-terracotta-50 border border-natural-terracotta-200 text-natural-terracotta-800 text-xs p-3 rounded-xl font-medium text-center shadow-xs animate-fadeIn">
                        {recoveryError}
                      </div>
                    )}

                    {recoverySuccess && (
                      <div className="bg-natural-sage-50 border border-natural-sage-200 text-natural-sage-950 text-xs p-3 rounded-xl font-medium text-center shadow-xs animate-fadeIn">
                        {recoverySuccess}
                      </div>
                    )}

                    {recoveryStep === 1 ? (
                      /* PASSO 1: SOLICITAR CÓDIGO */
                      <form onSubmit={handleRequestRecoveryCode} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-natural-stone block text-left">Usuário ou E-mail Registrado</label>
                          <input
                            id="recovery-input-key"
                            type="text"
                            required
                            placeholder="Seu usuário (Ex: joao_bio) ou seu e-mail"
                            value={recoveryInputKey}
                            onChange={e => setRecoveryInputKey(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage-600/15 focus:border-natural-sage-600 text-sm bg-natural-cream/30 text-natural-wood font-medium"
                          />
                        </div>

                        <button
                          id="btn-send-recovery"
                          type="submit"
                          disabled={recoveryLoading}
                          className="w-full bg-natural-sage-600 hover:bg-natural-sage-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm transition-colors text-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          {recoveryLoading ? "Enviando e-mail..." : "Receber Código por E-mail"}
                        </button>
                      </form>
                    ) : (
                      /* PASSO 2: VALIDAR CÓDIGO E DEFINIR NOVA SENHA */
                      <form onSubmit={handleConfirmRecovery} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-natural-stone block text-left font-mono">Código de Segurança (6 dígitos)</label>
                          <input
                            id="recovery-code"
                            type="text"
                            required
                            maxLength={6}
                            placeholder="Ex: 123456"
                            value={recoveryVerificationCode}
                            onChange={e => setRecoveryVerificationCode(e.target.value.replace(/\D/g, ""))}
                            className="w-full px-3.5 py-2 rounded-lg border border-natural-border text-center tracking-widest font-mono text-base font-bold bg-natural-cream/30 text-natural-wood focus:outline-none focus:ring-2 focus:ring-natural-sage-600/15 focus:border-natural-sage-600"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-natural-stone block text-left">Escolha sua Nova Senha</label>
                          <div className="relative">
                            <input
                              id="recovery-new-password"
                              type={showPassword ? "text" : "password"}
                              required
                              placeholder="Digite sua nova senha segura"
                              value={recoveryNewPassword}
                              onChange={e => setRecoveryNewPassword(e.target.value)}
                              className="w-full pl-3.5 pr-10 py-2 rounded-lg border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage-600/15 focus:border-natural-sage-600 text-sm bg-natural-cream/30 text-natural-wood font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-natural-stone hover:text-natural-wood cursor-pointer p-1 rounded-sm focus:outline-none"
                              title={showPassword ? "Ocultar senha" : "Ver senha"}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {recoveryDevCode && (
                          <div className="text-center pt-1 animate-fadeIn">
                            {!showDevCodeOption ? (
                              <button
                                type="button"
                                onClick={() => setShowDevCodeOption(true)}
                                className="text-[11px] font-bold text-natural-sage-700 hover:text-natural-sage-900 underline transition-colors cursor-pointer"
                              >
                                Não recebeu o código por e-mail? Obter código de teste local
                              </button>
                            ) : (
                              <div className="bg-amber-50/70 border border-amber-200/50 p-2.5 rounded-lg text-left shadow-2xs space-y-1">
                                <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">🛠️ CÓDIGO DE TESTE LOCAL</p>
                                <p className="text-[11px] text-amber-900 leading-normal font-medium">
                                  Caso o servidor de e-mail tenha sido bloqueado pelo firewall institucional, utilize o código abaixo:
                                </p>
                                <div className="mt-1.5 text-center">
                                  <span className="font-mono text-base font-extrabold text-amber-950 bg-white border border-amber-200 px-2.5 py-0.5 rounded select-all tracking-widest shadow-3xs">
                                    {recoveryDevCode}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <button
                          id="btn-confirm-recovery"
                          type="submit"
                          disabled={recoveryLoading}
                          className="w-full bg-natural-terracotta-600 hover:bg-natural-terracotta-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm transition-colors text-sm cursor-pointer disabled:opacity-50"
                        >
                          {recoveryLoading ? "Redefinindo..." : "Confirmar e Redefinir Senha"}
                        </button>

                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setRecoveryStep(1);
                              setRecoverySuccess("");
                              setRecoveryError("");
                              setRecoveryDevCode(null);
                              setShowDevCodeOption(false);
                            }}
                            className="text-xs font-bold text-natural-stone hover:text-natural-wood underline cursor-pointer"
                          >
                            ← Voltar, usar outro e-mail ou solicitar novo código
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="text-center pt-2.5 border-t border-natural-border">
                      <button
                        type="button"
                        onClick={() => {
                          setRecoveryMode(false);
                          setRecoveryStep(1);
                          setRecoveryError("");
                          setRecoverySuccess("");
                          setRecoveryInputKey("");
                          setRecoveryVerificationCode("");
                          setRecoveryNewPassword("");
                          setRecoveryDevCode(null);
                          setShowDevCodeOption(false);
                        }}
                        className="text-xs font-semibold text-natural-sage-800 hover:text-natural-sage-950 underline cursor-pointer"
                      >
                        Voltar para a tela de Login
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-center space-y-2">
                      <div className="mx-auto w-12 h-12 bg-natural-sage-50 text-natural-sage-950 rounded-full flex justify-center items-center border border-natural-sage-100">
                        <Award className="w-6 h-6 text-natural-sage-600 animate-pulse" />
                      </div>
                      <h2 className="text-2xl font-serif font-semibold text-natural-wood">
                        {authFormMode === "login" ? "Conectar ao Eco-Perfil" : "Criar Novo Eco-Perfil"}
                      </h2>
                      <p className="text-natural-stone text-xs text-center">
                        {authFormMode === "login" 
                          ? "Acesse com seu Usuário ou E-mail para sincronizar seus dados e acessar recursos de auditoria." 
                          : "Registre-se informando as duas informações básicas de identificação: Nome de usuário exclusivo e E-mail."}
                      </p>
                    </div>

                    {authError && (
                      <div className="bg-natural-terracotta-50 border border-natural-terracotta-200 text-natural-terracotta-800 text-xs p-3 rounded-lg font-medium text-center shadow-xs">
                        {authError}
                      </div>
                    )}

                    <form onSubmit={handleUserAuth} className="space-y-4">
                      {authFormMode === "register" && (
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-natural-stone block text-left">Nome Completo / Exibição</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Viver+Bio"
                            value={authDisplayName}
                            onChange={e => setAuthDisplayName(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage-600/15 focus:border-natural-sage-600 text-sm bg-natural-cream/30 text-natural-wood font-medium"
                          />
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-natural-stone block text-left">
                          {authFormMode === "login" ? "Nome de Usuário ou E-mail" : "Nome de Usuário (Exclusivo, ex: viverbio)"}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={authFormMode === "login" ? "Digite seu usuário ou email" : "Escolha um nome de usuário único"}
                          value={authUsername}
                          onChange={e => setAuthUsername(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage-600/15 focus:border-natural-sage-600 text-sm bg-natural-cream/30 text-natural-wood font-medium"
                        />
                      </div>

                      {authFormMode === "register" && (
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-natural-stone block text-left">E-mail (Exclusivo)</label>
                          <input
                            type="email"
                            required
                            placeholder="Ex: seu-email@provedor.com"
                            value={authEmail}
                            onChange={e => setAuthEmail(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage-600/15 focus:border-natural-sage-600 text-sm bg-natural-cream/30 text-natural-wood font-medium"
                          />
                        </div>
                      )}

                      {authFormMode === "register" && (
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-natural-stone block text-left">Região do Município</label>
                          <select
                            value={authRegionalContext}
                            onChange={e => setAuthRegionalContext(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage-600/15 focus:border-natural-sage-600 text-sm bg-natural-cream/30 text-natural-wood font-medium"
                          >
                            <option value="Centro">Centro</option>
                            <option value="Oficinas">Oficinas</option>
                            <option value="Uvaranas">Uvaranas</option>
                            <option value="Nova Rússia">Nova Rússia</option>
                            <option value="Contorno">Contorno</option>
                            <option value="Cará-Cará">Cará-Cará</option>
                            <option value="Colônia Dona Luíza">Colônia Dona Luíza</option>
                            <option value="Sabará">Sabará</option>
                            <option value="Vila Estrela">Vila Estrela</option>
                            <option value="Chapada">Chapada</option>
                            <option value="Ronda">Ronda</option>
                          </select>
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold text-natural-stone block text-left">Senha</label>
                          {authFormMode === "login" && (
                            <button
                              type="button"
                              onClick={() => {
                                setRecoveryMode(true);
                                setAuthError("");
                              }}
                              className="text-[11px] font-bold text-natural-terracotta-600 hover:text-natural-terracotta-800 underline focus:outline-none cursor-pointer"
                            >
                              Esqueceu a senha?
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Sua senha de segurança"
                            value={authPassword}
                            onChange={e => setAuthPassword(e.target.value)}
                            className="w-full pl-3.5 pr-10 py-2 rounded-lg border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage-600/15 focus:border-natural-sage-600 text-sm bg-natural-cream/30 text-natural-wood font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-natural-stone hover:text-natural-wood cursor-pointer p-1 rounded-sm focus:outline-none"
                            title={showPassword ? "Ocultar senha" : "Ver senha"}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full bg-natural-sage-600 hover:bg-natural-sage-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm transition-colors text-sm cursor-pointer disabled:opacity-50"
                      >
                        {authLoading ? "Conectando..." : authFormMode === "login" ? "Entrar na Conta" : "Registrar Eco-Perfil"}
                      </button>
                    </form>

                    <div className="text-center pt-2 border-t border-natural-border">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthFormMode(authFormMode === "login" ? "register" : "login");
                          setAuthError("");
                        }}
                        className="text-xs font-semibold text-natural-sage-800 hover:text-natural-sage-950 underline cursor-pointer"
                      >
                        {authFormMode === "login" 
                          ? "Não tem um Eco-Perfil? Crie sua conta agora" 
                          : "Já possui um Eco-Perfil? Faça o login"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Grid de Duas Colunas do Perfil */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* COLUNA ESQUERDA: PERFIL DO USUÁRIO E CONQUISTAS */}
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* CARD DE PERFIL INTERATIVO */}
                    <div className="bg-natural-card p-6 rounded-2xl border border-natural-border shadow-sm space-y-5">
                      <div className="text-center space-y-3">
                        <div className="relative inline-block">
                          <div className="w-20 h-20 bg-natural-cream text-4xl rounded-full flex justify-center items-center border-2 border-natural-sage-600 shadow-sm mx-auto select-none">
                            {userAvatar}
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-white border border-natural-border rounded-full p-1.5 shadow-xs">
                            <select
                              value={userAvatar}
                              onChange={(e) => handleSaveProfileField("avatar", e.target.value)}
                              className="text-xs bg-transparent border-none focus:outline-none cursor-pointer p-0"
                            >
                              <option value="🌱">🌱 Folha</option>
                              <option value="🦊">🦊 Raposa</option>
                              <option value="💧">💧 Gotícula</option>
                              <option value="⚡">⚡ Energia</option>
                              <option value="🗑️">🗑️ Coleta</option>
                              <option value="🎓">🎓 Acadêmico</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          {loggedUser && (
                            <div className="text-center pb-1">
                              <span className="inline-flex items-center gap-1 bg-natural-sage-100 text-natural-sage-950 text-xs font-bold font-mono tracking-wider px-3 py-1 rounded-full border border-natural-sage-200 shadow-3xs uppercase">
                                @{loggedUser.username}
                              </span>
                            </div>
                          )}
                          <input
                            type="text"
                            value={userName}
                            onChange={(e) => handleSaveProfileField("name", e.target.value)}
                            placeholder="Nome Completo"
                            className="w-full text-center text-lg font-serif font-bold text-natural-wood bg-transparent hover:bg-natural-cream focus:bg-natural-cream focus:outline-none px-2 py-0.5 rounded transition-all focus:ring-1 focus:ring-natural-sage-600 border-none outline-none"
                          />
                          <input
                            type="text"
                            value={userCourse}
                            onChange={(e) => handleSaveProfileField("course", e.target.value)}
                            placeholder="Sua Região / Localidade"
                            className="w-full text-center text-xs text-natural-stone bg-transparent hover:bg-natural-cream focus:bg-natural-cream focus:outline-none px-2 py-0.5 rounded transition-all font-mono tracking-wider border-none outline-none"
                          />
                        </div>
                      </div>

                      <div className="border-t border-natural-border pt-4 text-xs space-y-2.5 text-natural-stone">
                        <div className="flex justify-between items-center text-left">
                          <span>Nível Ecológico:</span>
                          <strong className="text-natural-sage-700 font-bold uppercase font-mono">
                            {userStats.aguaProtegida > 3000000 ? "Guardião Pleno" : userStats.aguaProtegida > 0 ? "EcoAtivista Prata" : "Recruta Verde"}
                          </strong>
                        </div>
                        <div className="flex justify-between items-center text-left">
                          <span>Status Viver+Bio:</span>
                          <span className="bg-natural-cream text-natural-wood border border-natural-border font-bold rounded-lg px-2 py-0.5 scale-95 font-mono uppercase">
                            Conectado
                          </span>
                        </div>
                        
                        <button
                          onClick={handleUserLogout}
                          className="w-full mt-2.5 inline-flex items-center justify-center gap-1.5 bg-natural-terracotta-50 hover:bg-natural-terracotta-100 text-natural-terracotta-800 text-xs font-bold py-2 px-3 rounded-xl border border-natural-terracotta-200 transition-colors cursor-pointer shadow-xs"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sair do Perfil
                        </button>
                      </div>
                      </div>

                {/* PAINEL DE CONQUISTAS (Badges que acendem!) */}
                <div className="bg-natural-card p-6 rounded-2xl border border-natural-border shadow-sm space-y-4">
                  <div className="border-b border-natural-border pb-2 text-left">
                    <h3 className="font-serif font-semibold text-natural-wood text-base">Minhas Conquistas Verdes</h3>
                    <p className="text-[11px] text-natural-stone">Simule e grave descartes para acender seus selos ecológicos.</p>
                  </div>

                  <div className="space-y-3.5">
                    
                    {/* Badge 1: Selo Pioneiro (Sempre desbloqueado) */}
                    <div className="flex items-center gap-3 bg-natural-cream/30 p-2.5 rounded-xl border border-natural-border">
                      <div className="text-2xl p-1 bg-natural-cream rounded-full border border-natural-border shrink-0">
                        🌱
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-natural-wood">Selo Eco-Iniciante</p>
                        <p className="text-[10px] text-natural-stone leading-tight">Iniciou sua jornada de descarte sustentável e consciência ecológica.</p>
                      </div>
                    </div>

                    {/* Badge 2: Protetor de Nascentes (Água > 0) */}
                    <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                      userStats.aguaProtegida > 0 
                        ? "bg-natural-sage-50 border-natural-sage-200 text-natural-wood"
                        : "bg-natural-cream/30 border-natural-border/30 opacity-50 grayscale"
                    }`}>
                      <div className={`text-2xl p-0.5 rounded-full border shrink-0 ${
                        userStats.aguaProtegida > 0 ? "bg-natural-sage-100 border-natural-sage-300" : "bg-neutral-200 border-neutral-300"
                      }`}>
                        💧
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold">Guardião das Nascentes</p>
                        <p className="text-[10px] text-natural-stone leading-tight">Preservou águas mapeando óleo de cozinha.</p>
                      </div>
                    </div>

                    {/* Badge 3: Escudo do Solo (Solo > 0) */}
                    <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                      userStats.soloProtegido > 0 
                        ? "bg-natural-sage-50 border-natural-sage-200 text-natural-wood"
                        : "bg-natural-cream/30 border-natural-border/30 opacity-50 grayscale"
                    }`}>
                      <div className={`text-2xl p-0.5 rounded-full border shrink-0 ${
                        userStats.soloProtegido > 0 ? "bg-natural-sage-100 border-natural-sage-300" : "bg-neutral-200 border-neutral-300"
                      }`}>
                        🔋
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold">Escudo de Pilhas</p>
                        <p className="text-[10px] text-natural-stone leading-tight">Protegeu solos de contaminação por metais pesados.</p>
                      </div>
                    </div>

                    {/* Badge 4: Ativista de Logística (Sugestão de Ponto Aprovada) */}
                    <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                      challenges.sugeriuPonto 
                        ? "bg-natural-sage-50 border-natural-sage-200 text-natural-wood"
                        : "bg-natural-cream/30 border-natural-border/30 opacity-50 grayscale"
                    }`}>
                      <div className={`text-2xl p-0.5 rounded-full border shrink-0 ${
                        challenges.sugeriuPonto ? "bg-natural-sage-100 border-natural-sage-300" : "bg-neutral-200 border-neutral-300"
                      }`}>
                        🗺️
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold">Cartógrafo Ecológico</p>
                        <p className="text-[10px] text-natural-stone leading-tight">Sugeriu novo ponto ecológico para o catálogo.</p>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* COLUNA DIREITA: IMPACTOS ACUMULADOS, CHALLENGES E HISTÓRICO */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* IMPACTOS ACUMULADOS */}
                <div className="bg-natural-card p-6 rounded-2xl border border-natural-border shadow-sm space-y-4">
                  <div className="text-left">
                    <h3 className="font-serif font-semibold text-natural-wood text-lg">Impacto Verde Acumulado</h3>
                    <p className="text-xs text-natural-stone">Soma consolidada de descartes e simulações gravadas em seu perfil.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    
                    {/* Agua acumulada */}
                    <div className="bg-natural-cream/30 p-4 rounded-xl border border-natural-border flex flex-col justify-between text-left">
                      <span className="text-[10px] text-natural-stone uppercase font-mono font-bold">Água Salva</span>
                      <strong className="text-xl font-serif text-natural-sage-950 mt-1">
                        {userStats.aguaProtegida.toLocaleString("pt-BR")} L
                      </strong>
                    </div>

                    {/* Solo Acumulado */}
                    <div className="bg-natural-cream/30 p-4 rounded-xl border border-natural-border flex flex-col justify-between text-left">
                      <span className="text-[10px] text-natural-stone uppercase font-mono font-bold">Solo Protegido</span>
                      <strong className="text-xl font-serif text-natural-sage-950 mt-1">
                        {userStats.soloProtegido.toLocaleString("pt-BR")} m²
                      </strong>
                    </div>

                    {/* CO2 Poupad */}
                    <div className="bg-natural-cream/30 p-4 rounded-xl border border-natural-border flex flex-col justify-between text-left">
                      <span className="text-[10px] text-natural-stone uppercase font-mono font-bold">CO₂ Mitigado</span>
                      <strong className="text-xl font-serif text-natural-sage-950 mt-1">
                        {userStats.co2Evitado.toLocaleString("pt-BR")} kg
                      </strong>
                    </div>

                    {/* Materias */}
                    <div className="bg-natural-cream/30 p-4 rounded-xl border border-natural-border flex flex-col justify-between text-left">
                      <span className="text-[10px] text-natural-stone uppercase font-mono font-bold">Mapeado Total</span>
                      <strong className="text-xl font-serif text-natural-sage-950 mt-1">
                        {userStats.materiasRecuperadas.toLocaleString("pt-BR")} g
                      </strong>
                    </div>

                    {/* Mercúrio */}
                    <div className="bg-natural-cream/30 p-4 rounded-xl border border-natural-border flex flex-col justify-between text-left">
                      <span className="text-[10px] text-natural-stone uppercase font-mono font-bold">Mercúrio Retido</span>
                      <strong className="text-xl font-serif text-natural-sage-950 mt-1">
                        {userStats.mercurioIsolado.toLocaleString("pt-BR")} mg
                      </strong>
                    </div>

                  </div>
                </div>



                {/* HISTÓRICO DE AUDITORIA PESSOAL & PONTOS SUGERIDOS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                  
                  {/* HISTÓRICO DO USUÁRIO */}
                  <div className="bg-natural-card p-5 rounded-2xl border border-natural-border shadow-sm space-y-3">
                    <div className="flex justify-between items-center border-b border-natural-border pb-1.5 text-left">
                      <h4 className="font-serif font-semibold text-natural-wood text-sm">Meu Histórico Verde</h4>
                      {userSavedSimulations.length > 0 && (
                        <button
                          onClick={handleClearHistory}
                          className="text-[11px] font-mono font-bold text-natural-terracotta-600 hover:text-natural-terracotta-800 transition-colors cursor-pointer"
                        >
                          Limpar Histórico
                        </button>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto space-y-3.5 pr-1 text-xs">
                      {userSavedSimulations.length > 0 ? (
                        (() => {
                          let displayList = [...userSavedSimulations];
                          if (loggedUser) {
                            let simCount = 0;
                            displayList = userSavedSimulations.filter(record => {
                              const isSim = !record.pontoConfirmado && record.tipoRegistro !== "entrega";
                              if (isSim) {
                                simCount++;
                                return simCount <= 3;
                              }
                              return true;
                            });
                          }
                          return displayList;
                        })().map((record, index) => (
                          <div key={record.id || index} className="p-3 bg-natural-cream/30 border border-natural-border rounded-xl text-left space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                {record.pontoConfirmado || record.tipoRegistro === "entrega" ? (
                                  <span className="inline-flex items-center gap-1 bg-natural-sage-100 text-natural-sage-950 text-[10px] font-bold px-2 py-0.5 rounded-full border border-natural-sage-200 uppercase tracking-wide">
                                    ✅ Entrega Realizada
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-natural-cream text-natural-stone text-[10px] font-bold px-2 py-0.5 rounded-full border border-natural-border uppercase tracking-wide">
                                    📊 Simulação de Impacto
                                  </span>
                                )}
                                <h5 className="font-bold text-natural-wood text-sm mt-1.5 leading-tight">
                                  {record.pontoConfirmado ? record.pontoConfirmado : `Simulação: ${record.bairro}`}
                                </h5>
                                <p className="text-[10px] text-natural-stone mt-0.5">{record.date} • Bairro: {record.bairro}</p>
                                {record.residuo && (
                                  <p className="text-[10px] text-natural-sage-800 font-mono font-medium mt-1">Material: <strong className="font-bold">{record.residuo}</strong></p>
                                )}
                              </div>
                              
                              <button
                                onClick={() => handleDeletePersonalRecord(record.id)}
                                className="p-1 hover:bg-natural-terracotta-50 text-natural-terracotta-500 hover:text-natural-terracotta-700 rounded transition-colors cursor-pointer shrink-0"
                                title="Excluir est registro"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* FOTO ANEXADA */}
                            {record.foto && (
                              <div className="mt-1 border border-natural-border rounded-lg overflow-hidden max-w-[150px] relative group shadow-3xs bg-black/5">
                                <img 
                                  src={record.foto} 
                                  alt="Foto de Coleta" 
                                  className="w-full h-16 object-cover cursor-zoom-in group-hover:opacity-90 transition-opacity"
                                  onClick={() => {
                                    const imgWindow = window.open();
                                    if (imgWindow) {
                                      imgWindow.document.write(`<img src="${record.foto}" style="max-width:100%; max-height:100vh; display:block; margin:auto;"/>`);
                                    }
                                  }}
                                  referrerPolicy="no-referrer"
                                />
                                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-bold py-0.5 text-center pointer-events-none">Clique para Ampliar</span>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1.5 border-t border-natural-border/40 text-[10px] font-medium text-natural-stone justify-between">
                              <span className="text-natural-sage-750">💧 Água: <strong className="font-bold">+{record.agua.toLocaleString()}L</strong></span>
                              <span className="text-natural-sage-800">🌱 Solo: <strong className="font-bold">+{record.solo}m²</strong></span>

                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-natural-sand italic text-center py-10">Use a calculadora para simular e gravar entregas.</p>
                      )}
                    </div>
                  </div>

                  {/* MINHAS SUGESTÕES SINCROIZADAS */}
                  <div className="bg-natural-card p-5 rounded-2xl border border-natural-border shadow-sm space-y-3.5">
                    <h4 className="font-serif font-semibold text-natural-wood text-sm text-left font-sans">Sugestões de Logística Enviadas</h4>
                    <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1 text-xs text-left">
                      {pontos.filter(p => mySuggestionIds.includes(p.id)).length > 0 ? (
                        pontos.filter(p => mySuggestionIds.includes(p.id)).map((ponto, index) => (
                          <div key={index} className="p-2.5 bg-natural-cream/30 border border-natural-border rounded-lg">
                            <div className="flex justify-between items-start gap-1 pb-1">
                              <span className="font-bold text-natural-wood leading-tight">{ponto.empresa}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                                ponto.aprovado === 1 
                                  ? "bg-natural-sage-100 text-natural-sage-950 border border-natural-sage-200" 
                                  : "bg-natural-terracotta-50 text-natural-terracotta-750 border border-natural-terracotta-100 animate-pulse"
                              }`}>
                                {ponto.aprovado === 1 ? "Ativo" : "Análise"}
                              </span>
                            </div>
                            <p className="text-[11px] text-natural-stone">{ponto.endereco}</p>
                            <p className="text-[10px] text-natural-sand font-mono mt-1">Resíduo: {ponto.tipo}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-natural-sand italic text-center py-10">Nenhum ponto enviado por você nesta sessão.</p>
                      )}
                    </div>
                  </div>

                  {/* FORMULÁRIO DE ENCAMINHAR SUGESTÕES GERAIS E FEEDBACKS */}
                  {!isAdmin && (
                    <div className="bg-natural-card p-5 rounded-2xl border border-natural-border shadow-sm space-y-3.5 text-left animate-fadeIn">
                      <div className="border-b border-natural-border pb-2">
                        <h4 className="font-serif font-semibold text-natural-wood text-sm flex items-center gap-1.5">
                          <span>✉️ Encaminhar Sugestões & Feedbacks</span>
                        </h4>
                        <p className="text-[11px] text-natural-stone font-medium">Envie críticas, melhorias ou elogios diretamente aos administradores da Viver+Bio.</p>
                      </div>

                      {suggestionSuccessMsg && (
                        <div className="bg-natural-sage-50 border border-natural-sage-200 text-natural-sage-950 text-xs p-3 rounded-lg font-medium shadow-3xs animate-fadeIn">
                          {suggestionSuccessMsg}
                        </div>
                      )}

                      <div className="space-y-2">
                        <textarea
                          placeholder="Digite aqui sugestões de novas cooperativas, ideias para a plataforma ou de políticas ambientais..."
                          rows={3}
                          value={userSuggestionText}
                          onChange={(e) => setUserSuggestionText(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-natural-border text-xs focus:ring-1 focus:ring-natural-sage-600 focus:border-natural-sage-600 bg-white text-natural-wood font-medium"
                        />
                        <button
                          onClick={handleSendSuggestion}
                          disabled={suggestionLoadingUser || !userSuggestionText.trim()}
                          className="w-full bg-natural-sage-600 hover:bg-natural-sage-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-2xs animate-fadeIn"
                        >
                          {suggestionLoadingUser ? "Enviando..." : "Enviar Sugestão"}
                        </button>
                      </div>
                    </div>
                  )}

                </div>

              </div> {/* Closes Column Right (col-span-8) */}
              
            </div> {/* Closes Profiles Grid (col-span-12) */}

            {/* CENTRAL DE ADMINISTRAÇÃO VIVER+BIO */}
            {isAdmin && (
              <div className="border-t border-natural-border pt-8 mt-4 space-y-8 animate-fadeIn">
                {/* Header Admin */}
                <div className="bg-natural-wood p-6 rounded-2xl text-natural-cream shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-natural-sage-600">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-natural-sage-400 shrink-0" />
                    <div>
                      <h2 className="text-lg font-serif font-semibold text-white">Central de Administração Viver+Bio</h2>
                      <p className="text-[11px] text-natural-light/80 uppercase font-mono tracking-widest">
                        Acesso concedido • Auditoria de Logística Ativa de PG
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      id="btn-export-csv"
                      href="/api/exportar-csv"
                      download
                      className="inline-flex items-center gap-2 bg-natural-sage-600 hover:bg-natural-sage-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors cursor-pointer shadow-xs border border-natural-sage-500/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Exportar Planilha .CSV
                    </a>
                  </div>
                </div>

                {/* Estatísticas e Formulário de Adição em Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Seção Esquerda: Monitoramento Geral & Novo Cadastro */}
                  <div className="lg:col-span-4 space-y-6 animate-fadeIn">
                    
                    {/* Mini Stats */}
                    <div className="bg-natural-card p-5 rounded-2xl border border-natural-border shadow-sm space-y-3.5 text-left">
                      <h3 className="font-serif font-semibold text-natural-wood text-base">Resumo da Base de Logística</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-natural-cream/40 p-3 rounded-lg border border-natural-border">
                          <span className="text-[10px] text-natural-stone block uppercase font-mono font-medium">Totais</span>
                          <span className="text-2xl font-serif font-bold text-natural-wood">{pontos.length}</span>
                        </div>
                        <div className="bg-natural-sage-50 p-3 rounded-lg border border-natural-sage-200">
                          <span className="text-[10px] text-natural-sage-800 block uppercase font-mono font-medium">Ativos</span>
                          <span className="text-2xl font-serif font-bold text-natural-sage-950">
                            {pontos.filter(p => p.aprovado === 1).length}
                          </span>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 col-span-2 text-left">
                          <span className="text-[10px] text-emerald-800 block uppercase font-mono font-bold">Entregas de Usuários</span>
                          <span className="text-lg font-bold text-emerald-950 flex items-center gap-1.5 mt-0.5">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            {logs.filter(log => log.includes("[ENTREGA REALIZADA]")).length} entregas físicas confirmadas
                          </span>
                        </div>
                        <div className="bg-natural-terracotta-50 p-3 rounded-lg border border-natural-terracotta-200 col-span-2 flex justify-between items-center text-left">
                          <div>
                            <span className="text-[10px] text-natural-terracotta-850 block uppercase font-mono font-semibold">Propostas em Análise</span>
                            <span className="text-2xl font-serif font-bold text-natural-terracotta-900">
                              {pontos.filter(p => p.aprovado === 0).length}
                            </span>
                          </div>
                          {pontos.filter(p => p.aprovado === 0).length > 0 && (
                            <span className="bg-natural-terracotta-600 text-white rounded px-2.5 py-1 text-[11px] font-bold animate-pulse uppercase tracking-wider">
                              Aprovar Agora!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Cadastrar Novo Ponto Direto */}
                    <div className="bg-natural-card p-6 rounded-2xl border border-natural-border shadow-sm space-y-4 text-left">
                      <div className="border-b border-natural-border pb-2">
                        <h4 className="font-serif font-semibold text-natural-wood text-base">Cadastrar Ponto Autorizado</h4>
                        <p className="text-xs text-natural-stone">Inclusão direta na base ativa de logísticas.</p>
                      </div>

                      {newPointSuccess && (
                        <div className="bg-natural-sage-50 border border-natural-sage-200 text-natural-sage-950 text-xs p-3 rounded-lg font-bold text-center animate-bounce shadow-xs">
                          Ponto de logística integrado e ativo!
                        </div>
                      )}

                      <form onSubmit={handleAdminCreatePoint} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-natural-stone block text-left">Nome Comercial / Empresa</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Supermercado TodoDia"
                            value={newPoint.empresa}
                            onChange={e => setNewPoint(prev => ({ ...prev, empresa: e.target.value }))}
                            className="w-full px-3 py-1.5 rounded-lg border border-natural-border text-xs bg-natural-cream/30 text-natural-wood font-medium focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-natural-stone block text-left">Resíduo Principal Aceito</label>
                          <select
                            value={newPoint.tipo}
                            onChange={e => setNewPoint(prev => ({ ...prev, tipo: e.target.value }))}
                            className="w-full px-3 py-1.5 rounded-lg border border-natural-border text-xs bg-natural-cream/40 text-natural-wood font-medium focus:outline-none"
                          >
                            <option value="Óleo">Óleo (Litros)</option>
                            <option value="Pilhas">Pilhas (Unid)</option>
                            <option value="Blisters">Blisters (Unid)</option>
                            <option value="Lixo Eletrônico">Lixo Eletrônico (Kg)</option>
                            <option value="Lâmpadas">Lâmpadas (Unid)</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-natural-stone block font-mono text-left">CEP</label>
                            <input
                              type="text"
                              required
                              placeholder="84000-000"
                              value={newPoint.cep}
                              onChange={handleAdminNewCepChange}
                              className="w-full px-3 py-1.5 rounded-lg border border-natural-border text-xs focus:ring-1 focus:ring-natural-sage-600 focus:border-natural-sage-600 bg-natural-cream/30 text-natural-wood font-medium font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-natural-stone block text-left">Bairro de PG</label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: Centro"
                              value={newPoint.bairro}
                              onChange={e => setNewPoint(prev => ({ ...prev, bairro: e.target.value }))}
                              className="w-full px-3 py-1.5 rounded-lg border border-natural-border text-xs focus:ring-1 focus:ring-natural-sage-600 focus:border-natural-sage-600 bg-natural-cream/30 text-natural-wood font-medium"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-natural-stone block text-left">Endereço Completo</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Av. Vicente Machado, 105"
                            value={newPoint.endereco}
                            onChange={e => setNewPoint(prev => ({ ...prev, endereco: e.target.value }))}
                            className="w-full px-3 py-1.5 rounded-lg border border-natural-border text-xs focus:ring-1 focus:ring-natural-sage-600 focus:border-natural-sage-600 bg-natural-cream/30 text-natural-wood font-medium"
                          />
                        </div>

                        <button
                          id="btn-admin-submit-point"
                          type="submit"
                          className="w-full bg-[#1f1917] hover:bg-natural-wood text-white font-semibold py-2 px-3 rounded-lg shadow-sm transition-colors text-xs cursor-pointer"
                        >
                          Criar Posto Ativo
                        </button>
                      </form>
                    </div>

                  </div>

                  {/* Seção Direita: Tabelas de Gestão */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Propostas de cidadãos */}
                    <div className="bg-natural-card p-6 rounded-2xl border border-natural-border shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b border-natural-border pb-2">
                        <div className="text-left">
                          <h4 className="font-serif font-semibold text-natural-wood text-base">Propostas de Logística em Análise</h4>
                          <p className="text-xs text-natural-stone">Sugestões enviadas por cidadãos aguardando sua auditoria e aprovação.</p>
                        </div>
                        <span className="bg-natural-terracotta-50 text-natural-terracotta-800 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-natural-terracotta-100">
                          {pontos.filter(p => p.aprovado === 0).length} Pendentes
                        </span>
                      </div>

                      <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1 text-left">
                        {pontos.filter(p => p.aprovado === 0).length > 0 ? (
                          pontos.filter(p => p.aprovado === 0).map((p) => (
                            <div key={p.id} className="p-4 bg-natural-cream/20 border border-natural-border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-left hover:bg-natural-cream/40 transition-colors">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <strong className="text-sm text-natural-wood">{p.empresa}</strong>
                                  <span className="bg-natural-terracotta-100 text-natural-terracotta-900 px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase">
                                    {p.tipo}
                                  </span>
                                </div>
                                <p className="text-xs text-natural-stone font-medium flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-natural-sage-600/70" />
                                  {p.endereco} • {p.bairro}
                                </p>
                                <span className="text-[10px] text-natural-sand font-semibold font-mono">CEP: {p.cep} | ID: {p.id}</span>
                              </div>

                              <div className="flex gap-2 w-full sm:w-auto self-stretch sm:self-auto justify-end">
                                <button
                                  onClick={() => handleApprove(p.id)}
                                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-natural-sage-600 hover:bg-natural-sage-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Aprovar
                                </button>
                                <button
                                  onClick={() => setEditingPoint(p)}
                                  className="inline-flex items-center justify-center bg-natural-cream hover:bg-natural-border text-natural-wood text-xs font-semibold p-1.5 rounded-lg transition-colors cursor-pointer border border-natural-border"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(p.id)}
                                  className="inline-flex items-center justify-center bg-natural-terracotta-50 hover:bg-natural-terracotta-100 text-natural-terracotta-800 text-xs font-semibold p-1.5 rounded-lg transition-colors cursor-pointer border border-natural-terracotta-200"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-natural-sand italic text-center py-10 text-xs">Nenhuma proposta de cidadão aguardando aprovação no momento.</p>
                        )}
                      </div>
                    </div>

                    {/* Gerenciamento de Postos Ativos */}
                    <div className="bg-natural-card p-6 rounded-2xl border border-natural-border shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-natural-border pb-2 text-left">
                        <div>
                          <h4 className="font-serif font-semibold text-natural-wood text-base">Logística Ativa Base de Dados</h4>
                          <p className="text-xs text-natural-stone">Visualização e edição dos pontos que aparecem na busca pública.</p>
                        </div>
                        
                        {/* Filtros */}
                        <div className="flex gap-1.5 bg-[#f6f2ee] p-1 rounded-lg border border-natural-border">
                          <button
                            onClick={() => setAdminFilter("all")}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold font-mono transition-colors cursor-pointer ${
                              adminFilter === "all" ? "bg-white text-natural-wood shadow-xs" : "text-natural-stone hover:text-natural-wood"
                            }`}
                          >
                            TODOS
                          </button>
                          <button
                            onClick={() => setAdminFilter("approved")}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold font-mono transition-colors cursor-pointer ${
                              adminFilter === "approved" ? "bg-natural-sage-100 text-natural-sage-950 shadow-xs" : "text-natural-stone hover:text-natural-wood"
                            }`}
                          >
                            ATIVOS
                          </button>
                          <button
                            onClick={() => setAdminFilter("pending")}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold font-mono transition-colors cursor-pointer ${
                              adminFilter === "pending" ? "bg-natural-terracotta-50 text-natural-terracotta-850 shadow-xs" : "text-natural-stone hover:text-natural-wood"
                            }`}
                          >
                            PENDENTES
                          </button>
                        </div>
                      </div>

                      <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                        {filteredPoints.length > 0 ? (
                          filteredPoints.map((p) => (
                            <div key={p.id} className="p-3 bg-natural-cream/15 border border-natural-border rounded-xl flex justify-between items-center gap-4 text-left hover:bg-natural-cream/35 transition-colors">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <strong className="text-xs text-natural-wood leading-none">{p.empresa}</strong>
                                  <span className={`text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded ${
                                    p.aprovado === 1 ? "bg-natural-sage-100 text-natural-sage-950 px-1 border border-natural-sage-200" : "bg-natural-terracotta-50 text-natural-terracotta-800 px-1 border border-natural-terracotta-100 animate-pulse"
                                  }`}>
                                    {p.aprovado === 1 ? "Ativo" : "Pendente"}
                                  </span>
                                  <span className="bg-[#f0e8e0] text-natural-wood text-[9px] font-bold font-mono px-1.5 py-0.5 rounded uppercase">
                                    {p.tipo}
                                  </span>
                                </div>
                                <p className="text-[11px] text-natural-stone mt-1">{p.endereco}, {p.bairro}</p>
                              </div>

                              <div className="flex gap-1.5 shrink-0">
                                <button
                                  onClick={() => setEditingPoint(p)}
                                  className="inline-flex items-center justify-center bg-natural-cream hover:bg-natural-border text-natural-wood text-xs font-semibold p-1.5 rounded-lg transition-colors cursor-pointer border border-natural-border"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(p.id)}
                                  className="inline-flex items-center justify-center bg-natural-terracotta-50 hover:bg-natural-terracotta-100 text-natural-terracotta-800 text-xs font-semibold p-1.5 rounded-lg transition-colors cursor-pointer border border-natural-terracotta-200"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-natural-sand italic text-center py-12 text-xs">Nenhum ponto registrado atende a este filtro.</p>
                        )}
                      </div>
                    </div>

                    {/* ENVIOS DE COMPROVANTES E ENTREGAS DOS CIDADÃOS */}
                    <div className="bg-natural-card p-6 rounded-2xl border border-natural-border shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b border-natural-border pb-2 text-left">
                        <div>
                          <h4 className="font-serif font-semibold text-natural-wood text-base">🖼️ Entregas Realizadas por Cidadãos (Auditoria Fiel)</h4>
                          <p className="text-xs text-natural-stone">Veja as confirmações reais de entrega física com foto anexada e remova se inválidas.</p>
                        </div>
                        <span className="bg-natural-sage-100 text-natural-sage-950 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-natural-sage-200">
                          {adminDeliveries.length} Entregas
                        </span>
                      </div>

                      <div className="max-h-[350px] overflow-y-auto space-y-3.5 pr-1">
                        {adminDeliveries.length > 0 ? (
                          adminDeliveries.map((deliv) => (
                            <div key={deliv.id} className="p-4 bg-natural-cream/25 border border-natural-border rounded-xl text-left hover:bg-natural-cream/45 transition-all">
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-natural-wood uppercase">
                                      👤 {deliv.username === "guest" ? "(perfil sem logar)" : `${deliv.displayName} (@${deliv.username})`}
                                    </span>
                                    <span className="bg-[#f0e8e0] text-natural-wood text-[9px] font-bold font-mono px-1.5 py-0.5 rounded uppercase">
                                      {deliv.residuo}
                                    </span>
                                  </div>
                                  <p className="text-xs text-natural-stone"><strong className="text-natural-wood">📍 Local:</strong> {deliv.pontoConfirmado}</p>
                                  <p className="text-[11px] text-natural-stone">📅 Data: {deliv.date} • Bairro: {deliv.bairro}</p>
                                  
                                  {/* Stats Impact */}
                                  <div className="flex gap-3 text-[10px] font-semibold text-natural-stone font-mono pt-1">
                                    <span className="text-natural-sage-800">💧 +{deliv.agua.toLocaleString()}L</span>
                                    <span className="text-natural-sage-750">🔋 +{deliv.solo}m²</span>

                                  </div>
                                </div>

                                <div className="flex flex-col sm:items-end gap-2 shrink-0 w-full sm:w-auto">
                                  <button
                                    onClick={() => handleDeleteAdminDelivery(deliv.id)}
                                    className="inline-flex items-center justify-center gap-1.5 bg-natural-terracotta-50 hover:bg-natural-terracotta-100 text-natural-terracotta-800 text-xs font-semibold py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer border border-natural-terracotta-200 w-full sm:w-auto mt-1"
                                    title="Remover permanentemente esta entrega"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Excluir Registro
                                  </button>
                                </div>
                              </div>

                              {/* FOTO DO COMPROVANTE */}
                              {deliv.foto ? (
                                <div className="mt-3 border border-natural-border rounded-xl overflow-hidden max-w-[200px] shadow-sm relative group bg-black/5">
                                  <img 
                                    src={deliv.foto} 
                                    alt="Comprovante de Descarte com Foto" 
                                    className="w-full h-24 object-cover cursor-zoom-in group-hover:opacity-90 transition-opacity"
                                    referrerPolicy="no-referrer"
                                    onClick={() => {
                                      const imgWindow = window.open();
                                      if (imgWindow) {
                                        imgWindow.document.write(`<img src="${deliv.foto}" style="max-width:100%; max-height:100vh; display:block; margin:auto;"/>`);
                                      }
                                    }}
                                  />
                                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-bold py-1 text-center pointer-events-none">Clique para Ampliar</span>
                                </div>
                              ) : (
                                <div className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] text-natural-sand bg-[#fcf8f5] px-2.5 py-1.5 rounded-lg border border-natural-border font-medium pb-2">
                                  <span>📷 Sem foto do descarte anexada</span>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-natural-sand italic text-center py-12 text-xs">Nenhuma entrega de cidadão realizada no servidor até o momento.</p>
                        )}
                      </div>
                    </div>

                    {/* CENTRAL DE SUGESTÕES E FEEDBACK DOS CIDADÃOS */}
                    <div className="bg-natural-card p-6 rounded-2xl border border-natural-border shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b border-natural-border pb-2 text-left">
                        <div>
                          <h4 className="font-serif font-semibold text-natural-wood text-base">📬 Central de Sugestões dos Cidadãos</h4>
                          <p className="text-xs text-natural-stone font-medium">Feedbacks, críticas e sugestões gerais enviadas pelos usuários do município.</p>
                        </div>
                        <span className="bg-natural-sage-100 text-natural-sage-950 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-natural-sage-200 animate-fadeIn">
                          {adminSuggestions.length} Sugestõ{adminSuggestions.length === 1 ? "ão" : "ões"}
                        </span>
                      </div>

                      <div className="max-h-[350px] overflow-y-auto space-y-3.5 pr-1 font-sans">
                        {adminSuggestions.length > 0 ? (
                          adminSuggestions.map((sug) => (
                            <div key={sug.id} className="p-4 bg-natural-sage-50/20 border border-natural-border rounded-xl text-left hover:bg-natural-sage-50/40 transition-all">
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-natural-wood">👤 Enviado por: <strong className="font-bold">{sug.senderName}</strong> ({sug.senderCourse})</span>
                                    <span className="bg-white text-natural-stone text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border border-natural-border">
                                      {sug.senderEmail}
                                    </span>
                                  </div>
                                  <p className="text-xs text-natural-wood font-medium leading-relaxed bg-white/70 p-2.5 rounded-lg border border-natural-border max-w-full">
                                    &ldquo;{sug.suggestionText}&rdquo;
                                  </p>
                                  <p className="text-[10px] text-natural-stone">
                                    📅 Enviado em: {sug.date} • ID: {sug.id}
                                  </p>
                                </div>

                                <div className="shrink-0 w-full sm:w-auto">
                                  <button
                                    onClick={() => handleArchiveSuggestion(sug.id)}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-natural-terracotta-100 hover:bg-natural-terracotta-200 text-natural-terracotta-800 text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors cursor-pointer border border-natural-terracotta-200 shadow-2xs"
                                    title="Arquivar Sugestão"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 animate-pulse" />
                                    Arquivar
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-natural-sand italic text-center py-12 text-xs animate-fadeIn">Nenhuma sugestão ou feedback de usuário recebido até o momento.</p>
                        )}
                      </div>
                    </div>

                    {/* ALERTAS/REPORTES DE PROBLEMAS EM PONTOS DE COLETA */}
                    <div className="bg-natural-card p-6 rounded-2xl border border-natural-border shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b border-natural-border pb-2 text-left">
                        <div>
                          <h4 className="font-serif font-semibold text-natural-wood text-base">⚠️ Alertas de Pontos de Entrega Inoperantes</h4>
                          <p className="text-xs text-natural-stone font-medium">Sinalizações enviadas por cidadãos sobre problemas em pontos de descarte.</p>
                        </div>
                        <span className="bg-natural-terracotta-100 text-natural-terracotta-800 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-natural-terracotta-200">
                          {adminReports.length} Alertas
                        </span>
                      </div>

                      <div className="max-h-[350px] overflow-y-auto space-y-3.5 pr-1">
                        {adminReports.length > 0 ? (
                          adminReports.map((rep) => (
                            <div key={rep.id} className="p-4 bg-natural-terracotta-50/40 border border-natural-terracotta-200 rounded-xl text-left hover:bg-natural-terracotta-50/65 transition-all">
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-natural-terracotta-900 uppercase">🏢 Ponto: {rep.pointName}</span>
                                    <span className="bg-natural-terracotta-100 text-natural-terracotta-800 text-[9px] font-bold font-mono px-1.5 py-0.5 rounded uppercase border border-natural-terracotta-200">
                                      ALERTA ATIVO
                                    </span>
                                  </div>
                                  <p className="text-xs text-natural-wood font-medium leading-relaxed bg-white/70 p-2.5 rounded-lg border border-natural-terracotta-100 max-w-full">
                                    💬 &ldquo;{rep.description}&rdquo;
                                  </p>
                                  <p className="text-[10px] text-natural-stone">
                                    👤 Reportado por: <strong className="text-natural-wood">{rep.reporterLabel}</strong> • 📅 Data: {rep.date}
                                  </p>
                                </div>

                                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0 w-full sm:w-auto">
                                  <button
                                    onClick={() => handleResolveReport(rep.id, "resolve")}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-natural-sage-600 hover:bg-natural-sage-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors cursor-pointer border border-natural-sage-500/20 shadow-2xs"
                                    title="Marcar como Resolvido"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Resolver
                                  </button>
                                  <button
                                    onClick={() => handleResolveReport(rep.id, "delete")}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-natural-terracotta-100 hover:bg-natural-terracotta-200 text-natural-terracotta-800 text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors cursor-pointer border border-natural-terracotta-200 shadow-2xs"
                                    title="Descartar Alerta"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    Descartar
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-natural-sand italic text-center py-12 text-xs">Nenhum alerta de funcionamento ativo no momento. Tudo operando perfeitamente!</p>
                        )}
                      </div>
                    </div>

                    {/* LOGS DE AUDITORIA DO SERVIDOR VIVER+BIO */}
                    <div className="bg-[#1f1917] text-natural-cream relative p-6 rounded-2xl border-l-4 border-natural-sage-600 shadow-md space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-natural-border/10 pb-3 text-left">
                        <div>
                          <h4 className="font-serif font-semibold text-white tracking-tight">Logs Geral de Entregas Viver+Bio</h4>
                          <p className="text-[11px] text-natural-light/60">Controle de entregas de materiais reais no município.</p>
                        </div>

                        <input
                          type="text"
                          placeholder="Filtrar por nome/regional..."
                          value={logFilter}
                          onChange={e => setLogFilter(e.target.value)}
                          className="bg-natural-wood/80 border border-natural-border/30 text-natural-cream text-xs rounded-lg px-3 py-1.5 w-full sm:w-64 focus:outline-none focus:border-natural-sage-500/50 focus:ring-0"
                        />
                      </div>

                      <p className="text-[10px] text-natural-light/70 font-mono text-left">
                        Auditoria ativa: Todos os descartes do Viver+Bio são gravados de forma permanente para integridade dos dados de PG.
                      </p>

                      <div className="bg-[#1a1514] p-4 rounded-xl border border-natural-border/20 max-h-60 overflow-y-auto block text-left">
                        <pre className="font-mono text-[11px] leading-relaxed text-natural-light/90 whitespace-pre-wrap divide-y divide-natural-border/10 break-all select-text">
                          {filteredLogs.length > 0 ? (
                            filteredLogs.map((log, idx) => {
                              const isEntrega = log.includes("[ENTREGA REALIZADA]");
                              return (
                                <div 
                                  key={idx} 
                                  className={`py-1.5 hover:text-natural-sage-300 transition-colors ${
                                    isEntrega 
                                      ? "text-emerald-400 font-semibold border-l-2 border-emerald-500 pl-2 bg-emerald-950/20 my-1 rounded-r" 
                                      : "text-natural-light/90"
                                  }`}
                                >
                                  {log}
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-natural-sand italic">Sem registros no log de auditoria.</div>
                          )}
                        </pre>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            )}
          </>
        )}
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer id="app-footer" className="mt-auto bg-[#1f1917] border-t border-natural-border/20 py-8 text-center text-xs text-natural-cream/70">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 EcoRota+Impacto. Plenamente adequado para consulta do plano municipal de resíduos.</p>
          <p className="font-mono text-natural-sage-400/80">Gestão e Logística Reversa de Resíduos</p>
        </div>
      </footer>

      {/* MODAL DE EDIÇÃO DE PONTO */}
      {editingPoint && (
        <div id="modal-edit-ponto" className="fixed inset-0 bg-natural-wood/75 backdrop-blur-xs flex justify-center items-center p-4 z-50 animate-fadeIn">
          <div className="bg-natural-card rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-natural-border">
            <div>
              <h3 className="text-lg font-serif font-semibold text-natural-wood">Editar Registro de Logística</h3>
              <p className="text-xs text-natural-stone">Modifique propriedades e sincronize com a base de dados.</p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs text-left">
              
              <div className="space-y-1">
                <label className="font-semibold text-natural-stone block">Empresa / Centro de Descarte</label>
                <input
                  type="text"
                  required
                  value={editingPoint.empresa}
                  onChange={e => setEditingPoint(prev => prev ? ({ ...prev, empresa: e.target.value }) : null)}
                  className="w-full px-3 py-2 rounded-lg border border-natural-border text-xs focus:ring-1 focus:ring-natural-sage-600 focus:border-natural-sage-600 bg-natural-cream/30 text-natural-wood font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-natural-stone block">Resíduo Recebido</label>
                <select
                  value={editingPoint.tipo}
                  onChange={e => setEditingPoint(prev => prev ? ({ ...prev, tipo: e.target.value }) : null)}
                  className="w-full px-3 py-2 rounded-lg border border-natural-border text-xs bg-natural-cream/40 text-natural-wood font-medium"
                >
                  <option value="Óleo">Óleo (Litros)</option>
                  <option value="Pilhas">Pilhas (Unid)</option>
                  <option value="Blisters">Blisters (Unid)</option>
                  <option value="Lixo Eletrônico">Lixo Eletrônico (Kg)</option>
                  <option value="Lâmpadas">Lâmpadas (Unid)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-natural-stone block">CEP</label>
                  <input
                    type="text"
                    required
                    value={editingPoint.cep}
                    onChange={e => setEditingPoint(prev => prev ? ({ ...prev, cep: e.target.value }) : null)}
                    className="w-full px-3 py-2 rounded-lg border border-natural-border text-xs focus:ring-1 focus:ring-natural-sage-600 focus:border-natural-sage-600 bg-natural-cream/30 text-natural-wood font-medium font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-natural-stone block">Bairro</label>
                  <input
                    type="text"
                    required
                    value={editingPoint.bairro}
                    onChange={e => setEditingPoint(prev => prev ? ({ ...prev, bairro: e.target.value }) : null)}
                    className="w-full px-3 py-2 rounded-lg border border-natural-border text-xs focus:ring-1 focus:ring-natural-sage-600 focus:border-natural-sage-600 bg-natural-cream/30 text-natural-wood font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-natural-stone block">Endereço</label>
                <input
                  type="text"
                  required
                  value={editingPoint.endereco}
                  onChange={e => setEditingPoint(prev => prev ? ({ ...prev, endereco: e.target.value }) : null)}
                  className="w-full px-3 py-2 rounded-lg border border-natural-border text-xs focus:ring-1 focus:ring-natural-sage-600 focus:border-natural-sage-600 bg-natural-cream/30 text-natural-wood font-medium"
                />
              </div>

              <div className="space-y-2 border-t border-natural-border/60 pt-3">
                <label className="font-semibold text-natural-stone block">Status de Ativação</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 font-medium text-natural-wood">
                    <input
                      type="radio"
                      name="status_ponto"
                      checked={editingPoint.aprovado === 1}
                      onChange={() => setEditingPoint(prev => prev ? ({ ...prev, aprovado: 1 }) : null)}
                      className="accent-natural-sage-600"
                    />
                    Ativo (Aprovado)
                  </label>
                  <label className="flex items-center gap-1.5 font-medium text-natural-wood">
                    <input
                      type="radio"
                      name="status_ponto"
                      checked={editingPoint.aprovado === 0}
                      onChange={() => setEditingPoint(prev => prev ? ({ ...prev, aprovado: 0 }) : null)}
                      className="accent-natural-sage-600"
                    />
                    Pendente
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-natural-border/60 pt-3">
                <button
                  id="btn-close-edit-modal"
                  type="button"
                  onClick={() => setEditingPoint(null)}
                  className="px-4 py-2 hover:bg-natural-cream rounded-lg text-natural-stone font-semibold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  id="btn-save-edit"
                  type="submit"
                  className="px-4 py-2 bg-natural-sage-600 hover:bg-natural-sage-700 text-white font-semibold rounded-lg shadow-sm cursor-pointer transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE ENTREGA COM FOTO OPCIONAL */}
      {deliveryModalPoint && (
        <div id="modal-confirm-delivery" className="fixed inset-0 bg-natural-wood/75 backdrop-blur-xs flex justify-center items-center p-4 z-50 animate-fadeIn text-xs">
          <div className="bg-natural-card rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-natural-border text-left">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-serif font-bold text-natural-wood">Confirmar Entrega Física</h3>
                <p className="text-xs text-natural-stone">Registre que você entregou resíduos de forma responsável neste ponto do mapa.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setDeliveryModalPoint(null)}
                className="p-1 hover:bg-natural-cream rounded-full transition-colors font-semibold"
              >
                <X className="w-5 h-5 text-natural-stone" />
              </button>
            </div>

            <div className="bg-natural-cream/30 border border-natural-border p-3.5 rounded-xl space-y-2">
              <p className="font-semibold text-natural-wood">Detalhes do Descarte:</p>
              <div className="space-y-1 text-natural-stone text-[11px] font-mono">
                <p>📍 <strong className="text-natural-wood">Local:</strong> {deliveryModalPoint.empresa}</p>
                <p>🗺️ <strong className="text-natural-wood">Endereço:</strong> {deliveryModalPoint.endereco}</p>
                <p>📦 <strong className="text-natural-wood">Resíduo:</strong> {deliveryModalResiduo}</p>
                <p>🏘️ <strong className="text-natural-wood">Bairro:</strong> {deliveryModalPoint.bairro || "Geral"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-natural-stone block">📸 Anexar Foto da Coleta (Opcional)</label>
              
              {!deliveryPhotoBase64 ? (
                <div className="border-2 border-dashed border-natural-border hover:border-natural-sage-600 transition-colors rounded-xl p-6 text-center cursor-pointer relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setDeliveryPhotoBase64(event.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
                    <Camera className="w-8 h-8 text-natural-stone group-hover:text-natural-sage-600 transition-colors" />
                    <p className="font-semibold text-natural-wood text-[11px]">Selecione uma foto da sua entrega</p>
                    <p className="text-[10px] text-natural-sand text-center">Clique para carregar imagem</p>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-natural-border shadow-xs max-h-[160px]">
                  <img 
                    src={deliveryPhotoBase64} 
                    alt="Comprovante de descarte" 
                    className="w-full h-32 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => setDeliveryPhotoBase64("")}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow-sm"
                    title="Remover foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-natural-border/60 pt-3">
              <button
                type="button"
                onClick={() => setDeliveryModalPoint(null)}
                className="px-4 py-2 hover:bg-natural-cream rounded-lg text-natural-stone font-semibold cursor-pointer transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => handleConfirmPointDelivery(deliveryModalPoint, deliveryModalResiduo, deliveryPhotoBase64)}
                className="px-4 py-2 bg-natural-sage-600 hover:bg-natural-sage-700 text-white font-semibold rounded-lg shadow-sm cursor-pointer transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Confirmar Entrega
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE REPORTE DE PROBLEMA EM PONTO DE COLETA */}
      {reportingPoint && (
        <div id="modal-report-point" className="fixed inset-0 bg-natural-wood/75 backdrop-blur-xs flex justify-center items-center p-4 z-50 animate-fadeIn text-xs">
          <div className="bg-natural-card rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-natural-border text-left">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-serif font-bold text-natural-terracotta-800">⚠️ Reportar Problema de Funcionamento</h3>
                <p className="text-[11px] text-natural-stone">Informe ao administrador sobre instabilidade ou encerramento neste local.</p>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setReportingPoint(null);
                  setReportReason("");
                }}
                className="p-1 hover:bg-natural-cream rounded-full transition-colors font-semibold shadow-3xs cursor-pointer"
              >
                <X className="w-4 h-4 text-natural-stone" />
              </button>
            </div>

            <div className="bg-natural-cream/35 border border-natural-border p-3 rounded-xl">
              <p className="font-semibold text-natural-wood text-xs">📍 Local Selecionado:</p>
              <p className="font-bold text-natural-wood text-sm">{reportingPoint.empresa}</p>
              <p className="text-xs text-natural-stone">{reportingPoint.endereco}</p>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-natural-stone block">Descreva qual o problema de funcionamento:</label>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Exemplo: O local encerrou as atividades, está fechado no horário informado, ou não recebe mais este tipo de resíduo..."
                className="w-full text-xs p-3 bg-natural-cream/20 border border-natural-border rounded-xl focus:outline-none focus:border-natural-terracotta-550 font-sans h-24"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-natural-border/60 pt-3">
              <button
                type="button"
                onClick={() => {
                  setReportingPoint(null);
                  setReportReason("");
                }}
                className="px-4 py-2 hover:bg-natural-cream rounded-lg text-natural-stone font-semibold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSendReport(reportingPoint, reportReason)}
                disabled={!reportReason.trim()}
                className="px-4 py-2 bg-natural-terracotta-600 hover:bg-natural-terracotta-700 text-white font-semibold rounded-lg shadow-sm cursor-pointer transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Enviar Alerta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO CUSTOMIZADO (ANTI-POPUP SANBOX IFRAME) */}
      {confirmModal.isOpen && (
        <div id="custom-confirm-modal" className="fixed inset-0 bg-natural-wood/85 backdrop-blur-xs flex justify-center items-center p-4 z-[9999] animate-fadeIn text-xs">
          <div className="bg-natural-card rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-natural-border text-center animate-scaleIn">
            <div className="space-y-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto border ${
                confirmModal.isDanger 
                  ? "bg-natural-terracotta-50 text-natural-terracotta-600 border-natural-terracotta-100" 
                  : "bg-natural-sage-50 text-natural-sage-600 border-natural-sage-100"
              }`}>
                {confirmModal.isDanger ? (
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                ) : (
                  <Check className="w-6 h-6 animate-pulse" />
                )}
              </div>
              <h3 className="text-base font-serif font-semibold text-natural-wood pt-1 leading-tight">{confirmModal.title}</h3>
              <p className="text-natural-stone text-xs leading-relaxed max-w-xs mx-auto pt-1">{confirmModal.message}</p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2 px-3 hover:bg-natural-cream text-natural-stone font-semibold rounded-xl border border-natural-border transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    if (confirmModal.onConfirm) {
                      await confirmModal.onConfirm();
                    }
                  } catch (err) {
                    console.error("Erro no callback de confirmação:", err);
                  } finally {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  }
                }}
                className={`flex-1 py-2 px-3 text-white font-semibold rounded-xl shadow-xs transition-colors cursor-pointer ${
                  confirmModal.isDanger 
                    ? "bg-natural-terracotta-600 hover:bg-natural-terracotta-700" 
                    : "bg-natural-sage-600 hover:bg-natural-sage-700"
                }`}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
