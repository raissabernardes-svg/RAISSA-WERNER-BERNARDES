import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";

interface PontoColeta {
  id: number;
  empresa: string;
  endereco: string;
  cep: string;
  bairro: string;
  tipo: string;
  aprovado: number;
  direcoesTexto?: string;
}

// Caminhos de persistência física
const DB_PATH = path.join(process.cwd(), "pontos_db.json");
const LOG_PATH = path.join(process.cwd(), "historico.txt");

// Dicionário de cache de CEPs para validação imediata no Município (Ex: 84010-000 -> Centro, 84031-000 -> Uvaranas, etc.)
const CEP_CACHE: Record<string, string> = {
  "84010-000": "Centro",
  "84010-010": "Centro",
  "84010-020": "Centro",
  "84020-000": "Centro",
  "84030-000": "Nova Rússia",
  "84031-000": "Uvaranas",
  "84032-000": "Uvaranas",
  "84035-000": "Distrito Industrial",
  "84040-000": "Oficinas",
  "84043-000": "Oficinas",
  "84045-000": "Estrela",
  "84050-000": "Rondinha",
  "84060-000": "Olarias",
  "84062-000": "Olarias",
  "84070-000": "Jardim Carvalho",
  "84071-000": "Jardim Carvalho",
  "84080-000": "Contorno"
};

// Base de dados refinada de faixas oficiais de CEP por Bairro do Município
const REGRAS_CEP_BAIRRO = [
  { bairro: "Área Rural", start: 84099899, end: 84099899 },
  { bairro: "Boa Vista", start: 84070040, end: 84073905 },
  { bairro: "Cará-cará", start: 84026383, end: 84045018 },
  { bairro: "Centro", start: 84001970, end: 84126970 },
  { bairro: "Chapada", start: 84062000, end: 84064615 },
  { bairro: "Colônia Dona Luíza", start: 84043000, end: 84047042 },
  { bairro: "Contorno", start: 84052000, end: 84062610 },
  { bairro: "Estrela", start: 84040000, end: 84050915 },
  { bairro: "Guaragi", start: 84120970, end: 84120970 },
  { bairro: "Jardim Carvalho", start: 84015150, end: 84020155 },
  { bairro: "Neves", start: 84020040, end: 84030758 },
  { bairro: "Nova Rússia", start: 84010430, end: 84071981 },
  { bairro: "Oficinas", start: 84035310, end: 84045981 },
  { bairro: "Olarias", start: 84026280, end: 84035970 },
  { bairro: "Orfãs", start: 84010650, end: 84070280 },
  { bairro: "Piriquitos", start: 84064006, end: 84065890 },
  { bairro: "Ronda", start: 84010700, end: 84059490 },
  { bairro: "Uvaranas", start: 84020000, end: 84033260 }
];

// Carregar pontos do banco local
function getDB(): PontoColeta[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return [];
    }
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Erro ao ler banco de dados JSON:", err);
    return [];
  }
}

// Salvar pontos no banco local
function saveDB(data: PontoColeta[]) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao salvar no banco de dados JSON:", err);
  }
}

// Escrever consulta no histórico de logs industriais
function logConsulta(logLine: string) {
  try {
    const time = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
    const formattedLine = `[${time}] ${logLine}\n`;
    fs.appendFileSync(LOG_PATH, formattedLine, "utf-8");
  } catch (err) {
    console.error("Erro ao escrever no historico.txt:", err);
  }
}

const app = express();
app.use(express.json({ limit: "15mb" }));

// API: Validar CEP localmente com as regras oficiais de bairros (CEP 84000-001 a 84129-999)
app.get("/api/validar-cep/:cep", (req, res) => {
  const inputCep = req.params.cep.trim().replace(/\D/g, "");
  const numericCep = parseInt(inputCep, 10);
  
  if (isNaN(numericCep) || numericCep < 84000001 || numericCep > 84129999) {
    return res.json({ valido: false, msg: "CEP fora do perímetro municipal coberto ou inválido" });
  }

  const cleancedCep = inputCep.length >= 8 ? `${inputCep.slice(0, 5)}-${inputCep.slice(5)}` : inputCep;

  // 1. Buscar correspondência em bairros específicos (exceto o Centro de cobertura maciça)
  let matchedBairro = REGRAS_CEP_BAIRRO
    .filter(r => r.bairro !== "Centro")
    .find(r => numericCep >= r.start && numericCep <= r.end)?.bairro;

  // 2. Tentar Centro se não casou com nenhum específico
  if (!matchedBairro) {
    const centroRule = REGRAS_CEP_BAIRRO.find(r => r.bairro === "Centro");
    if (centroRule && numericCep >= centroRule.start && numericCep <= centroRule.end) {
      matchedBairro = "Centro";
    }
  }

  // 3. Fallback para CEP_CACHE histórico se necessário ou Região Geral
  if (!matchedBairro) {
    matchedBairro = CEP_CACHE[cleancedCep];
  }

  if (!matchedBairro) {
    matchedBairro = "Limites Urbanos (Bairro Geral)";
  }

  return res.json({ valido: true, bairro: matchedBairro, cep: cleancedCep });
});

// Simulador de Rotas Textuais: Função na camada do Controller que gera direções dinâmicas
function gerarDirecoesTexto(bairroOrigem: string, bairroDestino: string): string {
  const origem = (bairroOrigem || "").trim()
    .replace(" (Ponta Grossa)", "")
    .replace(" (Bairro Geral)", "")
    .replace(" (Limites Urbanos)", "")
    .replace("Limites Urbanos (Bairro Geral)", "Bairro Geral");
  const destino = (bairroDestino || "").trim();

  if (!origem || origem.toLowerCase() === "bairro geral" || origem.toLowerCase() === "ponta grossa" || origem.toLowerCase() === "região geral" || origem.toLowerCase() === "limites urbanos") {
    return `Rota sugerida: A partir da sua localização atual, dirija-se à região do bairro ${destino} para realizar o descarte ecológico seguro. Distância física aproximada: ~3.5 km.`;
  }

  if (origem.toLowerCase() === destino.toLowerCase()) {
    return `Super próximo! Como você já está em ${origem}, siga pelas vias locais de tráfego residencial e procure as placas de identificação do local de coleta. Distância estimada: ~0.8 km.`;
  }

  const origemM = origem.toLowerCase();
  const destinoM = destino.toLowerCase();

  // Uvaranas
  if (origemM.includes("uvaranas")) {
    if (destinoM.includes("centro")) {
      return `Rota sugerida: Saia da sua região em Uvaranas, acesse a Av. General Carlos Cavalcanti e siga as placas sentido Centro Cidade. Vire à direita na R. Balduíno Taques para acessar o ponto de coleta. Distância estimada: ~2.5 km.`;
    }
    if (destinoM.includes("oficinas")) {
      return `Rota sugerida: Saia de Uvaranas seguindo pela Av. General Carlos Cavalcanti, tome a R. Júlia Wanderley e rume sentido sul conectando-se à Av. Visconde de Mauá em Oficinas. Distância estimada: ~5.1 km.`;
    }
    if (destinoM.includes("nova rússia") || destinoM.includes("russia")) {
      return `Rota sugerida: Saia da sua região em Uvaranas, acesse a Av. General Carlos Cavalcanti, siga pela R. Francisco Búrzio e conecte-se à R. Ernesto Vilela em Nova Rússia. Distância estimada: ~4.5 km.`;
    }
    if (destinoM.includes("industrial")) {
      return `Rota sugerida: Partindo de Uvaranas, pegue a Av. General Carlos Cavalcanti, conecte-se à R. Valério Renner e utilize as alças viárias para atingir a BR-376 sentido Distrito Industrial. Distância estimada: ~9.8 km.`;
    }
    return `Rota sugerida: Saia da sua região em Uvaranas, acesse a Av. General Carlos Cavalcanti ou vias secundárias e siga as placas em direção ao ponto de coleta em ${destino}. Distância estimada: ~4.2 km.`;
  }

  // Centro
  if (origemM.includes("centro")) {
    if (destinoM.includes("uvaranas")) {
      return `Rota sugerida: A partir do Centro da Cidade, siga pela Av. Vicente Machado, cruze o viaduto Eurico Batista Rosas em sentido à Av. General Carlos Cavalcanti em Uvaranas. Distância estimada: ~3.0 km.`;
    }
    if (destinoM.includes("oficinas")) {
      return `Rota sugerida: Saindo do Centro, tome a Av. Visconde de Taunay ou desça pela R. Benjamin Constant em direção à Av. Visconde de Mauá em Oficinas. Distância estimada: ~2.8 km.`;
    }
    if (destinoM.includes("nova rússia") || destinoM.includes("russia")) {
      return `Rota sugerida: A partir do Centro, siga pela R. Francisco Búrzio e mantenha-se à esquerda acessando a Av. Dom Pedro II em sentido à Nova Rússia. Distância estimada: ~2.4 km.`;
    }
    if (destinoM.includes("industrial")) {
      return `Rota sugerida: Partindo do Centro, siga pela R. Balduíno Taques, acesse a PR-151 ou rume pela Rodovia BR-376 em direção às instalações do Distrito Industrial. Distância estimada: ~7.5 km.`;
    }
    return `Rota sugerida: A partir do Centro, siga pela via arterial principal correspondente em direção ao ponto em ${destino}. Distância estimada: ~3.1 km.`;
  }

  // Oficinas
  if (origemM.includes("oficinas")) {
    if (destinoM.includes("centro")) {
      return `Rota sugerida: Saindo de Oficinas, pegue a Av. Visconde de Mauá sentido norte, suba pela R. Balduíno Taques e acesse o logradouro no Centro. Distância estimada: ~2.5 km.`;
    }
    if (destinoM.includes("uvaranas")) {
      return `Rota sugerida: Partindo de Oficinas, use a R. Franco Grilo, acesse a R. Júlia Wanderley e prossiga até a Av. General Carlos Cavalcanti em Uvaranas. Distância estimada: ~4.9 km.`;
    }
    if (destinoM.includes("nova rússia") || destinoM.includes("russia")) {
      return `Rota sugerida: Começando em Oficinas, tome a Av. Visconde de Mauá, prossiga pela Av. Visconde de Taunay interligando com a R. Ernesto Vilela em Nova Rússia. Distância estimada: ~6.0 km.`;
    }
    if (destinoM.includes("industrial")) {
      return `Rota sugerida: Saindo de Oficinas, pegue a R. Emílio de Almeida Nogueira e acesse diretamente o trecho sul da Rodovia BR-376 em direção ao Distrito Industrial. Distância estimada: ~6.5 km.`;
    }
    return `Rota sugerida: Saindo de Oficinas, utilize a Av. Visconde de Mauá e dirija-se pelas conexões municipais em direção ao ponto em ${destino}. Distância estimada: ~4.0 km.`;
  }

  // Nova Rússia
  if (origemM.includes("nova rússia") || origemM.includes("russia")) {
    if (destinoM.includes("centro")) {
      return `Rota sugerida: Iniciando em Nova Rússia, utilize a Av. Dom Pedro II, converta na R. Francisco Búrzio e dirija-se à zona central. Distância estimada: ~2.3 km.`;
    }
    if (destinoM.includes("uvaranas")) {
      return `Rota sugerida: Começando em Nova Rússia, utilize a R. Ernesto Vilela, siga pela R. Bento Ribeiro e converta rumo à Av. General Carlos Cavalcanti em Uvaranas. Distância estimada: ~4.5 km.`;
    }
    if (destinoM.includes("oficinas")) {
      return `Rota sugerida: Partindo de Nova Rússia, dirija-se à R. Anita Garibaldi, rume pela Av. Visconde de Taunay e acesse a Av. Visconde de Mauá em Oficinas. Distância estimada: ~5.8 km.`;
    }
    if (destinoM.includes("industrial")) {
      return `Rota sugerida: Iniciando em Nova Rússia, utilize o acesso à alça da Rodovia BR-376 e conduza pela rodovia até o Distrito Industrial. Distância estimada: ~8.2 km.`;
    }
    return `Rota sugerida: Iniciando em Nova Rússia, tome a Av. Dom Pedro II ou vias integradas rumo à zona de entrega ecológica em ${destino}. Distância estimada: ~3.8 km.`;
  }

  // Distrito Industrial
  if (origemM.includes("industrial") || origemM.includes("distrito")) {
    if (destinoM.includes("centro")) {
      return `Rota sugerida: Saindo do Distrito Industrial, pegue a alça de acesso à Rodovia BR-376 sentido norte e converta na Av. Visconde de Mauá até o Centro. Distância estimada: ~7.9 km.`;
    }
    if (destinoM.includes("oficinas")) {
      return `Rota sugerida: Do Distrito Industrial, use a BR-376 norte, pegue o trevo da alça de Oficinas e rume pela Av. Visconde de Mauá. Distância estimada: ~6.2 km.`;
    }
    if (destinoM.includes("uvaranas")) {
      return `Rota sugerida: Do Distrito Industrial, acesse a BR-376, derive à direita pela PR-151 e rume pelas vias de integração até Uvaranas. Distância estimada: ~10.2 km.`;
    }
    if (destinoM.includes("nova rússia")) {
      return `Rota sugerida: Do Distrito Industrial, rume norte pela BR-376 e tome o viaduto de desvio à direita sentido R. Ernesto Vilela em Nova Rússia. Distância estimada: ~8.0 km.`;
    }
    return `Rota sugerida: Saindo do Distrito Industrial, tome a Rodovia BR-376 e faça o desvio apropriado até o ponto de descarte em ${destino}. Distância estimada: ~7.0 km.`;
  }

  return `Rota sugerida: Partindo de ${origem}, prossiga pelas vias interbairros conectoras em direção ao bairro ${destino} para o descarte regulamentado. Distância estimada: ~4.5 km.`;
}

// API: Processar roteamento por afunilamento e calcular impactos
app.post("/api/calcular-impacto", (req, res) => {
  const { cep, oleo, pilhas, blisters, lixoEletronico, lampadas } = req.body;

  // Normalizar quantidades informadas
  const qtyOleo = parseFloat(oleo) || 0;
  const qtyPilhas = parseInt(pilhas) || 0;
  const qtyBlisters = parseInt(blisters) || 0;
  const qtyLixo = parseFloat(lixoEletronico) || 0;
  const qtyLampadas = parseInt(lampadas) || 0;

  // Validar CEP para resolver bairro utilizando a base de dados refinada do município
  const cleanedCep = cep ? cep.trim().replace(/\D/g, "") : "";
  let formattedCep = cep || "";
  let resolvedBairro = "Bairro Geral";
  
  if (cleanedCep) {
    const numCep = parseInt(cleanedCep, 10);
    const hyphenCep = cleanedCep.length >= 8 ? `${cleanedCep.slice(0, 5)}-${cleanedCep.slice(5)}` : cleanedCep;
    formattedCep = hyphenCep;

    if (numCep >= 84000001 && numCep <= 84129999) {
      let matched = REGRAS_CEP_BAIRRO
        .filter(r => r.bairro !== "Centro")
        .find(r => numCep >= r.start && numCep <= r.end)?.bairro;

      if (!matched) {
        const centroRule = REGRAS_CEP_BAIRRO.find(r => r.bairro === "Centro");
        if (centroRule && numCep >= centroRule.start && numCep <= centroRule.end) {
          matched = "Centro";
        }
      }

      if (!matched) {
        matched = CEP_CACHE[hyphenCep];
      }

      if (matched) {
        resolvedBairro = matched;
      }
    }
  }

  // 1. Cálculos de Impacto Ecológico (Lógica de Negócios)
  // - Óleo: 1L protege 1.000.000 Litros de água. Excede ao programa Feira Verde (math.floor de L de Óleo)
  const aguaProtegida = qtyOleo * 1000000;
  const feiraVerdeCredits = Math.floor(qtyOleo);

  // - Pilhas: meta pesados mitigados solo. Digamos que 1 pilha contamina cerca de 50 m2 de solo com metais pesados.
  const soloProtegido = qtyPilhas * 50; 
  const metaisRetidosPilhas = qtyPilhas * 15; // 15 gramas de metais retidos por pilha

  // - Blisters: 1 blister recupera 1.5g de plástico e 0.5g de alumínio de alta pureza
  const plasticoRecuperado = qtyBlisters * 1.5;
  const aluminioRecuperado = qtyBlisters * 0.5;

  // - Lixo Eletrônico: 1kg evita 1.8kg de CO2 e recupera 100g de metais raros/nobres
  const co2EvitadoLixo = qtyLixo * 1.8;
  const metaisRecuperadosLixo = qtyLixo * 100;

  // - Lâmpadas: 1 lâmpada fluorescente contém cerca de 5mg de mercúrio altamente volátil
  const mercurioIsolado = qtyLampadas * 5; // miligramas

  // 2. Determinação de Rotas por Afunilamento (Algoritmo de Busca)
  // Coletamos todos os resíduos que têm quantidade > 0 para pesquisar onde descartá-los
  const residuosPesquisados: string[] = [];
  if (qtyOleo > 0) residuosPesquisados.push("Óleo");
  if (qtyPilhas > 0) residuosPesquisados.push("Pilhas");
  if (qtyBlisters > 0) residuosPesquisados.push("Blisters");
  if (qtyLixo > 0) residuosPesquisados.push("Lixo Eletrônico");
  if (qtyLampadas > 0) residuosPesquisados.push("Lâmpadas");

  const db = getDB();
  const pontosAprovados = db.filter(p => p.aprovado === 1);
  const rotasSugeridas: { residuo: string; nivelBusca: string; pontos: PontoColeta[] }[] = [];

  for (const residuo of residuosPesquisados) {
    let pontosEncontrados: PontoColeta[] = [];
    let nivel = "Default";

    // Nível 1: Busca por CEP exato
    if (formattedCep) {
      pontosEncontrados = pontosAprovados.filter(
        p => p.tipo === residuo && p.cep.replace(/\D/g, "") === cleanedCep
      );
      if (pontosEncontrados.length > 0) {
        nivel = "1º Nível: CEP Exato do Usuário";
      }
    }

    // Nível 2: Busca por proximidade do Bairro (Fuzzy / LIKE no sqlite ou string contains)
    if (pontosEncontrados.length === 0 && resolvedBairro !== "Bairro Geral") {
      pontosEncontrados = pontosAprovados.filter(p => {
        if (p.tipo !== residuo) return false;
        const bUser = resolvedBairro.toLowerCase();
        const bPonto = p.bairro.toLowerCase();
        return bPonto.includes(bUser) || bUser.includes(bPonto);
      });
      if (pontosEncontrados.length > 0) {
        nivel = "2º Nível: Bairro por Proximidade";
      }
    }

    // Nível 3: Ponto geral da cidade para esse resíduo
    if (pontosEncontrados.length === 0) {
      pontosEncontrados = pontosAprovados.filter(p => p.tipo === residuo);
      nivel = "3º Nível: Ponto Geral da Cidade (Nenhum local encontrado no seu bairro)";
    }

    // Gerar direções de texto dinâmicas utilizando o simulador no Controller
    const pontosComRotas = pontosEncontrados.map(p => ({
      ...p,
      direcoesTexto: gerarDirecoesTexto(resolvedBairro, p.bairro)
    }));

    rotasSugeridas.push({
      residuo,
      nivelBusca: nivel,
      pontos: pontosComRotas
    });
  }

  // 3. Auditoria Industrial: Gravar Log de Consulta
  const totalPontosRoteados = rotasSugeridas.reduce((sum, r) => sum + r.pontos.length, 0);
  const residLine = `Calculou: Oleo=${qtyOleo}L, Pilhas=${qtyPilhas}un, Blisters=${qtyBlisters}un, Lixo=${qtyLixo}Kg, Lampadas=${qtyLampadas}un`;
  const routeLine = `CEP: ${formattedCep || "Não Informado"} Bairro: ${resolvedBairro} | Roteado para ${totalPontosRoteados} locais.`;
  logConsulta(`${residLine} | ${routeLine}`);

  // Responder com os cálculos detalhados e as rotas
  return res.json({
    bairroResolvido: resolvedBairro,
    impactos: {
      aguaProtegida,
      feiraVerdeCredits,
      soloProtegido,
      metaisRetidosPilhas,
      plasticoRecuperado,
      aluminioRecuperado,
      co2EvitadoLixo,
      metaisRecuperadosLixo,
      mercurioIsolado
    },
    rotasSugeridas
  });
});

// API: CRUD de Pontos de Coleta
// Retornar todos os pontos
app.get("/api/pontos", (req, res) => {
  const db = getDB();
  return res.json(db);
});

// Inserir sugestão de ponto pelo cidadão (aprovado = 0) ou admin direto
app.post("/api/pontos", (req, res) => {
  const { empresa, endereco, cep, bairro, tipo, aprovado } = req.body;

  if (!empresa || !endereco || !cep || !bairro || !tipo) {
    return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
  }

  const db = getDB();
  const novoId = db.length > 0 ? Math.max(...db.map(p => p.id)) + 1 : 1;

  const novoPonto: PontoColeta = {
    id: novoId,
    empresa: empresa.trim(),
    endereco: endereco.trim(),
    cep: cep.trim(),
    bairro: bairro.trim(),
    tipo,
    aprovado: aprovado !== undefined ? Number(aprovado) : 0
  };

  db.push(novoPonto);
  saveDB(db);

  logConsulta(`Novo Ponto adicionado/sugerido: ID ${novoPonto.id} - ${novoPonto.empresa} (Aprovado: ${novoPonto.aprovado})`);
  return res.json({ success: true, ponto: novoPonto });
});

// Editar ou Aprovar ponto de coleta
app.put("/api/pontos/:id", (req, res) => {
  const targetId = parseInt(req.params.id, 10);
  const { empresa, endereco, cep, bairro, tipo, aprovado } = req.body;

  const db = getDB();
  const index = db.findIndex(p => p.id === targetId);

  if (index === -1) {
    return res.status(404).json({ error: "Ponto de coleta não encontrado." });
  }

  // Atualizar dados
  if (empresa !== undefined) db[index].empresa = empresa.trim();
  if (endereco !== undefined) db[index].endereco = endereco.trim();
  if (cep !== undefined) db[index].cep = cep.trim();
  if (bairro !== undefined) db[index].bairro = bairro.trim();
  if (tipo !== undefined) db[index].tipo = tipo;
  if (aprovado !== undefined) db[index].aprovado = Number(aprovado);

  saveDB(db);

  logConsulta(`Ponto ID ${targetId} atualizado. Status de approval: ${db[index].aprovado}`);
  return res.json({ success: true, ponto: db[index] });
});

// Excluir ponto de coleta
app.delete("/api/pontos/:id", (req, res) => {
  const targetId = parseInt(req.params.id, 10);
  const db = getDB();
  const filtrado = db.filter(p => p.id !== targetId);

  if (db.length === filtrado.length) {
    return res.status(404).json({ error: "Ponto de coleta não encontrado." });
  }

  saveDB(filtrado);
  logConsulta(`Ponto ID ${targetId} excluído do banco de dados de logística reversa.`);
  return res.json({ success: true });
});

// Exportar CSV de pontos de coleta
app.get("/api/exportar-csv", (req, res) => {
  const db = getDB();
  
  // Estrutura CSV
  let csvContent = "\uFEFF"; // BOM para suportar acentuação no Excel em português
  csvContent += "ID,Empresa,Endereco,CEP,Bairro,Tipo_Residuo,Aprovado_Status\n";

  db.forEach(p => {
    // Sanatizar vírgulas
    const emp = p.empresa.replace(/"/g, '""');
    const end = p.endereco.replace(/"/g, '""');
    const b = p.bairro.replace(/"/g, '""');
    csvContent += `${p.id},"${emp}","${end}","${p.cep}","${b}","${p.tipo}",${p.aprovado === 1 ? "Ativo" : "Pendente"}\n`;
  });

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=pontos_coleta_pg.csv");
  return res.send(csvContent);
});

// Caminho do banco de dados de usuários ecológicos registrados
const USERS_DB_PATH = path.join(process.cwd(), "usuarios_db.json");
const PRODUTOS_DB_PATH = path.join(process.cwd(), "produtos_db.json");

interface ProdutoTroca {
  id: string;
  name: string;
  points: number;
  stock: number;
  description: string;
  icon: string;
  imageUrl?: string;
  redeemAddress?: string;
}

interface UserStats {
  aguaProtegida: number;
  co2Evitado: number;
  soloProtegido: number;
  materiasRecuperadas: number;
  mercurioIsolado: number;
  feiraVerdeCredits: number;
}

interface UserAccount {
  username: string; // identificador único em minúsculo
  email: string; // email único em minúsculo
  passwordHash: string; // senha criptografada sha256
  displayName: string;
  regionalContext: string;
  avatar: string;
  stats: UserStats;
  challenges: Record<string, boolean>;
  savedSimulations: any[];
}

// Carregar banco de usuários
function getUsersDB(): Record<string, UserAccount> {
  let db: Record<string, UserAccount> = {};
  let changed = false;
  try {
    if (fs.existsSync(USERS_DB_PATH)) {
      const data = fs.readFileSync(USERS_DB_PATH, "utf-8");
      db = JSON.parse(data);
    }
  } catch (err) {
    console.error("Erro ao ler banco de dados de usuários:", err);
    db = {};
  }

  // Pre-seed do usuário administrador Viver+Bio
  const adminUsername = "viverbio";
  const adminEmail = "viverbio.pg@gmail.com";
  
  if (!db[adminUsername]) {
    const passwordHash = crypto.createHash("sha256").update("ViverMaisBio@2026").digest("hex");
    db[adminUsername] = {
      username: adminUsername,
      email: adminEmail,
      passwordHash,
      displayName: "Viver+Bio",
      regionalContext: "Administrador Geral",
      avatar: "✨",
      stats: {
        aguaProtegida: 3500000,
        co2Evitado: 350,
        soloProtegido: 1200,
        materiasRecuperadas: 45000,
        mercurioIsolado: 1500,
        feiraVerdeCredits: 25
      },
      challenges: {
        canecaRu: true,
        papaPilhas: true,
        primeiroCalculo: true,
        sugeriuPonto: true,
        ecoMultiplicador: true
      },
      savedSimulations: [
        {
          id: "seed-simulation-1",
          date: new Date().toLocaleDateString("pt-BR"),
          bairro: "Centro",
          agua: 250000,
          co2: 50,
          solo: 150,
          feiraVerde: 15,
          pontoConfirmado: "Ponto Central Viver+Bio",
          residuo: "Óleo"
        }
      ]
    };
    changed = true;
  }

  // Pre-seed do usuário convidado/anonimo para registros de entrega sem login
  if (!db["guest"]) {
    db["guest"] = {
      username: "guest",
      email: "guest@viverbio.org",
      passwordHash: "no-login-for-guest",
      displayName: "(perfil sem logar)",
      regionalContext: "Geral",
      avatar: "🌱",
      stats: {
        aguaProtegida: 0,
        co2Evitado: 0,
        soloProtegido: 0,
        materiasRecuperadas: 0,
        mercurioIsolado: 0,
        feiraVerdeCredits: 0
      },
      challenges: {},
      savedSimulations: []
    };
    changed = true;
  }

  // Garantir que cada registro de simulação possua um ID único para exclusão fidedigna
  Object.entries(db).forEach(([username, user]) => {
    if (user.savedSimulations && Array.isArray(user.savedSimulations)) {
      user.savedSimulations.forEach((record: any, idx: number) => {
        if (!record.id) {
          record.id = (record.tipoRegistro || "rec") + "-" + Date.now() + "-" + idx + "-" + Math.floor(Math.random() * 1000000);
          changed = true;
        }
      });
    }
  });

  if (changed) {
    try {
      fs.writeFileSync(USERS_DB_PATH, JSON.stringify(db, null, 2), "utf-8");
    } catch (err) {
      console.error("Erro ao salvar migração de IDs de simulação:", err);
    }
  }

  return db;
}

// Salvar banco de usuários
function saveUsersDB(data: Record<string, UserAccount>) {
  try {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao salvar banco de dados de usuários:", err);
  }
}

// Confirmar e registrar descarte físico entregue pelo usuário
app.post("/api/registrar-descarte", (req, res) => {
  const { userName, userCourse, bairro, quantidades, pontoConfirmado, temFoto, record } = req.body;
  const name = userName ? userName.trim() : "Painel";
  const desc = userCourse ? userCourse.trim() : "Membro Sustentável";
  const b = bairro || "Geral";

  const qtyOleo = parseFloat(quantidades?.oleo) || 0;
  const qtyPilhas = parseInt(quantidades?.pilhas) || 0;
  const qtyBlisters = parseInt(quantidades?.blisters) || 0;
  const qtyLixo = parseFloat(quantidades?.lixoEletronico) || 0;
  const qtyLampadas = parseInt(quantidades?.lampadas) || 0;

  const descritivo: string[] = [];
  if (qtyOleo > 0) descritivo.push(`${qtyOleo}L Óleo`);
  if (qtyPilhas > 0) descritivo.push(`${qtyPilhas}un Pilhas`);
  if (qtyBlisters > 0) descritivo.push(`${qtyBlisters}un Blisters`);
  if (qtyLixo > 0) descritivo.push(`${qtyLixo}Kg Eletrônicos`);
  if (qtyLampadas > 0) descritivo.push(`${qtyLampadas}un Lâmpadas`);

  const materialsStr = descritivo.length > 0 ? descritivo.join(", ") : "Materiais Diversos";
  const pontoStr = pontoConfirmado ? ` | Ponto: ${pontoConfirmado.trim()}` : "";
  const fotoStr = temFoto ? " | Com Comprovante Fotográfico" : " | Sem Foto";
  const logLine = `[ENTREGA REALIZADA] Usuário: ${name} (${desc})${pontoStr} | Regional: ${b} | Material: ${materialsStr}${fotoStr}`;
  logConsulta(logLine);

  // Se houver um record e o usuário atual for visitante / sem logar, salvamos no perfil "guest" do banco
  if (record) {
    const db = getUsersDB();
    if (!db["guest"]) {
      db["guest"] = {
        username: "guest",
        email: "guest@viverbio.org",
        passwordHash: "no-login-for-guest",
        displayName: "(perfil sem logar)",
        regionalContext: "Geral",
        avatar: "🌱",
        stats: {
          aguaProtegida: 0,
          co2Evitado: 0,
          soloProtegido: 0,
          materiasRecuperadas: 0,
          mercurioIsolado: 0,
          feiraVerdeCredits: 0
        },
        challenges: {},
        savedSimulations: []
      };
    }
    // Adicionar entrega sob o perfil sem logar (guest)
    db["guest"].savedSimulations.unshift({
      ...record,
      id: record.id || "del-" + Date.now() + "-" + Math.floor(Math.random() * 1000000),
      tipoRegistro: "entrega"
    });
    saveUsersDB(db);
  }

  return res.json({ success: true, logged: logLine });
});

// API: Registro de Usuários Ecológicos (Requer nome e email e senha, sem duplicados)
app.post("/api/user/register", (req, res) => {
  const { username, email, password, displayName, regionalContext, avatar } = req.body;
  
  if (!username || !email || !password || !displayName) {
    return res.json({ success: false, error: "Nome de usuário, E-mail e Senha são obrigatórios para registrar seu perfil." });
  }

  const normalizedUser = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();
  const db = getUsersDB();

  // Verificar se o nome de usuário já existe
  if (db[normalizedUser]) {
    return res.json({ success: false, error: "Este nome de usuário já está registrado. Escolha outro!" });
  }

  // Verificar se o e-mail já existe
  const emailExists = Object.values(db).some(user => user.email && user.email.trim().toLowerCase() === normalizedEmail);
  if (emailExists) {
    return res.json({ success: false, error: "Este endereço de e-mail já está em uso por outro usuário." });
  }

  // Criptografar a senha do usuário em SHA-256
  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

  const initialUser: UserAccount = {
    username: normalizedUser,
    email: normalizedEmail,
    passwordHash,
    displayName: displayName.trim(),
    regionalContext: regionalContext ? regionalContext.trim() : "Centro",
    avatar: avatar || "🌱",
    stats: {
      aguaProtegida: 0,
      co2Evitado: 0,
      soloProtegido: 0,
      materiasRecuperadas: 0,
      mercurioIsolado: 0,
      feiraVerdeCredits: 0
    },
    challenges: {
      canecaRu: false,
      papaPilhas: false,
      primeiroCalculo: false,
      sugeriuPonto: false,
      ecoMultiplicador: false
    },
    savedSimulations: []
  };

  db[normalizedUser] = initialUser;
  saveUsersDB(db);

  logConsulta(`[CADASTRO] Novo Eco-Perfil registrado: "${initialUser.displayName}" (@${normalizedUser})`);

  // Retornar dados sem hash de senha
  const { passwordHash: _, ...publicUserData } = initialUser;
  const token = "eco_usr_session_" + normalizedUser + "_" + Date.now();
  return res.json({ success: true, token, user: publicUserData });
});

// API: Login de Usuários Ecológicos (Aceita Nome ou Email)
app.post("/api/user/login", (req, res) => {
  const { username, password } = req.body; // 'username' serve para receber o Nome/Usuário ou o E-mail
  if (!username || !password) {
    return res.json({ success: false, error: "Usuário/E-mail e senha são necessários para o login." });
  }

  const inputKey = username.trim().toLowerCase();
  const db = getUsersDB();
  
  // Buscar o cadastro pelo username ou e-mail
  let user = db[inputKey];
  if (!user) {
    // Buscar pelo email
    user = Object.values(db).find(u => u.email && u.email.trim().toLowerCase() === inputKey);
  }

  if (!user) {
    return res.json({ success: false, error: "Não encontramos um perfil cadastrado com este Usuário ou E-mail." });
  }

  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  if (user.passwordHash !== passwordHash) {
    return res.json({ success: false, error: "Senha incorreta! Proteção de credenciais ativa." });
  }

  logConsulta(`[LOGIN] Usuário @${user.username} ("${user.displayName}") conectou-se com sucesso.`);

  // Retornar dados sem hash de senha
  const { passwordHash: _, ...publicUserData } = user;
  const token = "eco_usr_session_" + user.username + "_" + Date.now();
  return res.json({ success: true, token, user: publicUserData });
});

// Armazenamento temporário de códigos de redefinição de senha
// Chave: email do usuário (normalizado), Valor: { code: string; username: string; expires: number }
const RECOVERY_CODES: Record<string, { code: string; username: string; expires: number }> = {};

// Função auxiliar para enviar e-mail real via SMTP, ou realizar log e bypass em ambiente de preview
async function sendRecoveryEmail(toEmail: string, username: string, code: string): Promise<{ success: boolean; simulated: boolean; info?: any; error?: string }> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || "no-reply@viverbio.org";

  const mailOptions = {
    from: `"EcoRota+Impacto" <${smtpFrom}>`,
    to: toEmail,
    subject: `Recuperação de Conta - Código de Segurança: ${code}`,
    text: `Olá, ${username}!\n\nVocê solicitou a recuperação da sua senha no aplicativo EcoRota+Impacto.\n\nSeu código de redefinição de senha é:\n${code}\n\nEste código é válido por 15 minutos.\n\nSe você não solicitou essa alteração, por favor ignore este e-mail.\n\nAtenciosamente,\nEquipe EcoRota+Impacto`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #fafaf9; color: #1c1917;">
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #e1e7ec; padding-bottom: 15px;">
          <h2 style="color: #15803d; margin: 0; font-family: 'Playfair Display', serif; font-size: 24px;">🌱 EcoRota+Impacto</h2>
          <p style="font-size: 11px; color: #78716c; margin: 4px 0 0 0; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">Logística Reversa & Impacto Ecológico Municipal</p>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #44403c;">Olá, <strong style="color: #1c1917;">${username}</strong>!</p>
        
        <p style="font-size: 14px; line-height: 1.6; color: #44403c;">Recebemos uma solicitação de redefinição de senha para o seu Eco-Perfil na plataforma de descarte municipal EcoRota+Impacto.</p>
        
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0;">
          <p style="margin: 0 0 10px 0; font-size: 12px; color: #166534; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Código de Autenticação</p>
          <div style="font-size: 32px; font-weight: 800; color: #15803d; letter-spacing: 6px; font-family: monospace; display: inline-block; padding: 5px 15px; background: white; border: 1px solid #dcfce7; border-radius: 8px; margin-bottom: 4px;">
            ${code}
          </div>
          <p style="margin: 6px 0 0 0; font-size: 11px; color: #15803d;">Este código expira em 15 minutos.</p>
        </div>
        
        <p style="font-size: 13px; line-height: 1.6; color: #78716c;">Caso você não tenha solicitado a redefinição de senha, basta desconsiderar este e-mail. Nenhuma ação será tomada e sua conta continuará segura.</p>
        
        <div style="margin-top: 35px; padding-top: 20px; border-top: 1px solid #e7e5e4; font-size: 11px; text-align: center; color: #a8a29e;">
          <p style="margin: 0;">© 2026 EcoRota+Impacto • Painel de Gestão de Resíduos</p>
          <p style="margin: 4px 0 0 0;">Este é um e-mail automático do sistema. Não responda a esta mensagem.</p>
        </div>
      </div>
    `
  };

  // Se as credenciais de SMTP não existirem, usamos o FormSubmit como fallback de envio de e-mails reais sem necessidade de configuração manual ou registro!
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log(`[E-MAIL REAL via FormSubmit] Enviando e-mail real de recuperação para ${toEmail} (@${username}) via FormSubmit. Código gerado: ${code}`);
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${toEmail}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Referer": "https://viverbio.org/",
          "Origin": "https://viverbio.org"
        },
        body: JSON.stringify({
          "_subject": `🌱 EcoRota+Impacto - Redefinição de Senha: ${code}`,
          "Nome de Usuário": username,
          "Código de Segurança de 6 dígitos": code,
          "Mensagem de Alerta": `Olá, ${username}! Seu código para redefinição segura de senha no EcoRota+Impacto é: ${code}. Copie-o e digite-o de volta na tela de recuperação.`,
          "Ação Necessária (Se for primeiro uso)": "Como medida de proteção do gateway de saída, certifique-se de clicar em 'Activate Form' se for solicitada uma validação de primeira entrega para este endereço.",
          "Validade do Código": "15 minutos"
        })
      });
      const parsed = await response.json();
      console.log(`[FORMSUBMIT SUCESSO] Resposta do envio para ${toEmail}:`, parsed);
      return { success: true, simulated: false, info: parsed };
    } catch (err: any) {
      console.error(`[FORMSUBMIT ERRO] Falha crítica de conexão para enviar via FormSubmit para ${toEmail}:`, err);
      // Retorna como simulado para autoteste de emergência do desenvolvedor / usuário local
      return { success: true, simulated: true, error: err.message };
    }
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      timeout: 10000 // 10s timeout
    } as any);

    const info = await transporter.sendMail(mailOptions);
    console.log(`[E-MAIL ENVIADO REAL] ID: ${info.messageId} para ${toEmail}`);
    return { success: true, simulated: false, info };
  } catch (err: any) {
    console.error(`[ERRO NODEMAILER] Falha ao enviar email real para ${toEmail}. Erro:`, err);
    return { success: false, simulated: false, error: err.message };
  }
}

// API: Solicitar redefinição de senha (envio de email com código)
app.post("/api/user/recover-request", async (req, res) => {
  const { inputKey } = req.body;
  if (!inputKey || inputKey.trim().length === 0) {
    return res.json({ success: false, error: "Por favor, digite seu Usuário ou e-mail cadastrado." });
  }

  const keyClean = inputKey.trim().toLowerCase();
  const db = getUsersDB();

  // Buscar usuário por username ou por e-mail
  let user = db[keyClean];
  if (!user) {
    user = Object.values(db).find(u => u.email && u.email.trim().toLowerCase() === keyClean);
  }

  if (!user || !user.email) {
    return res.json({ success: false, error: "Nenhum Eco-Perfil cadastrado com este Usuário ou E-mail ativo." });
  }

  const userEmail = user.email.trim().toLowerCase();
  const userUsername = user.username;

  // Gerar código randômico de 6 dígitos
  const code = String(Math.floor(100000 + Math.random() * 900000));
  RECOVERY_CODES[userEmail] = {
    code,
    username: userUsername,
    expires: Date.now() + 15 * 60 * 1000 // 15 min de expiração
  };

  const mailResult = await sendRecoveryEmail(user.email, userUsername, code);

  let finalSimulated = mailResult.simulated;
  let successMsg = mailResult.simulated 
    ? `Um e-mail de redefinição para ${user.email} foi simulado pelo sistema (SMTP não configurado).`
    : `O e-mail contendo seu código de segurança foi enviado para o endereço: ${user.email}`;

  if (!mailResult.success) {
    console.warn(`[RECOVER REQUEST FALLBACK] Falha no envio de e-mail real para ${user.email}. Usando fallback simulado local:`, mailResult.error);
    finalSimulated = true;
    successMsg = `Ambiente de teste ativo: Código de recuperação pronto para uso no endereço ${user.email}.`;
  }

  logConsulta(`[SOLICITAÇÃO DE SENHA] Código de recuperação solicitado para o e-mail: ${user.email} (Usuário: ${userUsername}). status_email: ${finalSimulated ? 'simulado' : 'real'}`);

  return res.json({
    success: true,
    email: user.email,
    username: userUsername,
    simulated: finalSimulated,
    devCode: finalSimulated ? code : null,
    message: successMsg
  });
});

// API: Validar código e redefinir senha com sucesso
app.post("/api/user/recover-confirm", (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.json({ success: false, error: "Todos os campos (E-mail, Código e Nova Senha) são obrigatórios." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const recoveryItem = RECOVERY_CODES[normalizedEmail];

  if (!recoveryItem) {
    return res.json({ success: false, error: "Nenhuma solicitação de recuperação ativa para este e-mail. Solicite um novo código." });
  }

  if (Date.now() > recoveryItem.expires) {
    delete RECOVERY_CODES[normalizedEmail];
    return res.json({ success: false, error: "Este código de segurança expirou (limite de 15 minutos). Solicite um novo código." });
  }

  if (recoveryItem.code !== code.trim()) {
    return res.json({ success: false, error: "O código digitado é inválido. Verifique o seu e-mail." });
  }

  // Redefinir senha com sucesso
  const db = getUsersDB();
  const user = db[recoveryItem.username];

  if (!user) {
    return res.json({ success: false, error: "Inconsistência de registro: usuário não encontrado." });
  }

  const passwordHash = crypto.createHash("sha256").update(newPassword).digest("hex");
  user.passwordHash = passwordHash;
  db[recoveryItem.username] = user;
  saveUsersDB(db);

  // Limpar código usado
  delete RECOVERY_CODES[normalizedEmail];

  logConsulta(`[SENHA REDEFINIDA] O usuário @${recoveryItem.username} redefiniu sua senha usando código de e-mail verificado.`);

  return res.json({
    success: true,
    message: "Sua senha foi redefinida com extremo sucesso! Agora você já pode fazer log-in com sua nova senha segura."
  });
});

// API: Sincronização e Salvamento em Tempo Real - Nuvem Persistent
app.post("/api/user/sync", (req, res) => {
  const { token, stats, challenges, savedSimulations, displayName, regionalContext, avatar } = req.body;
  if (!token || !token.startsWith("eco_usr_session_")) {
    return res.status(401).json({ success: false, error: "Sessão inválida ou expirada." });
  }

  // Extrair username do token de sessão
  const parts = token.split("_");
  const username = parts[3]; // 'eco', 'usr', 'session', 'USERNAME', 'TS'
  if (!username) {
    return res.status(401).json({ success: false, error: "Token malformado." });
  }

  const db = getUsersDB();
  const user = db[username];
  if (!user) {
    return res.status(404).json({ success: false, error: "Usuário não encontrado no servidor." });
  }

  // Atualizar propriedades conforme alteradas
  if (stats) user.stats = stats;
  if (challenges) user.challenges = challenges;
  if (savedSimulations) user.savedSimulations = savedSimulations;
  if (displayName) user.displayName = displayName.trim();
  if (regionalContext) user.regionalContext = regionalContext.trim();
  if (avatar) user.avatar = avatar;

  db[username] = user;
  saveUsersDB(db);

  const { passwordHash: _, ...publicUserData } = user;
  return res.json({ success: true, user: publicUserData });
});

// Obter todas as entregas realizadas com ou sem foto de todos os usuários
app.get("/api/admin/deliveries", (req, res) => {
  const db = getUsersDB();
  const allDeliveries: any[] = [];

  Object.entries(db).forEach(([username, user]) => {
    if (user.savedSimulations && Array.isArray(user.savedSimulations)) {
      user.savedSimulations.forEach((record: any) => {
        // As entregas têm "pontoConfirmado"
        if (record.pontoConfirmado) {
          allDeliveries.push({
            id: record.id,
            username,
            displayName: user.displayName || username,
            date: record.date,
            bairro: record.bairro,
            agua: record.agua,
            co2: record.co2,
            solo: record.solo,
            feiraVerde: record.feiraVerde,
            pontoConfirmado: record.pontoConfirmado,
            residuo: record.residuo,
            foto: record.foto || null,
            tipoRegistro: record.tipoRegistro || "entrega"
          });
        }
      });
    }
  });

  return res.json({ success: true, deliveries: allDeliveries });
});

// Excluir entrega específica pelo ID (remove de qualquer usuário que possua essa entrega)
app.delete("/api/admin/deliveries/:id", (req, res) => {
  const { id } = req.params;
  const db = getUsersDB();
  let found = false;

  Object.entries(db).forEach(([username, user]) => {
    if (user.savedSimulations && Array.isArray(user.savedSimulations)) {
      const originalLength = user.savedSimulations.length;
      user.savedSimulations = user.savedSimulations.filter((record: any) => record.id !== id);
      if (user.savedSimulations.length !== originalLength) {
        found = true;

        // Recalcular stats do usuário conforme exclusão
        const stats = {
          aguaProtegida: 0,
          co2Evitado: 0,
          soloProtegido: 0,
          materiasRecuperadas: 0,
          mercurioIsolado: 0,
          feiraVerdeCredits: 0
        };
        user.savedSimulations.forEach((r: any) => {
          stats.aguaProtegida += Number(r.agua) || 0;
          stats.co2Evitado += Number(r.co2) || 0;
          stats.soloProtegido += Number(r.solo) || 0;
          stats.materiasRecuperadas += Number(r.materias) || 0;
          stats.mercurioIsolado += Number(r.mercurio) || 0;
          stats.feiraVerdeCredits += Number(r.feiraVerde) || 0;
        });
        user.stats = stats;

        // Logar exclusão no histórico do servidor
        logConsulta(`[REGISTRO EXCLUÍDO] Descarte/Entrega ID ${id} de @${username} foi removida permanentemente pelo Administrador.`);
      }
    }
  });

  if (found) {
    saveUsersDB(db);
    return res.json({ success: true });
  }

  return res.status(404).json({ success: false, error: "Registro não encontrado." });
});

// API: Obter dados atualizados do usuário autenticado no carregamento da tela
app.get("/api/user/me", (req, res) => {
  const token = (req.query.token as string) || req.headers.authorization;
  if (!token || !token.startsWith("eco_usr_session_")) {
    return res.status(401).json({ success: false, error: "Sessão inválida." });
  }

  const parts = token.split("_");
  const username = parts[3];
  if (!username) {
    return res.status(401).json({ success: false, error: "Token inválido." });
  }

  const db = getUsersDB();
  const user = db[username];
  if (!user) {
    return res.status(404).json({ success: false, error: "Usuário não encontrado." });
  }

  const { passwordHash: _, ...publicUserData } = user;
  return res.json({ success: true, user: publicUserData });
});

// Banco de dados persistente de reportes de instabilidade/fechamento em pontos de entrega
const REPORTES_DB_PATH = path.join(process.cwd(), "reportes_db.json");

interface Reporte {
  id: string;
  pointId: number;
  pointName: string;
  reporterLabel: string;
  description: string;
  date: string;
  resolved: boolean;
}

function getReportesDB(): Reporte[] {
  try {
    if (!fs.existsSync(REPORTES_DB_PATH)) {
      return [];
    }
    const data = fs.readFileSync(REPORTES_DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Erro ao ler banco de dados de reportes:", err);
    return [];
  }
}

function saveReportesDB(data: Reporte[]) {
  try {
    fs.writeFileSync(REPORTES_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao salvar banco de reportes:", err);
  }
}

// Submeter um reporte/alerta de ponto inativo pelo cidadão
app.post("/api/pontos/reportar", (req, res) => {
  const { pointId, pointName, reporterLabel, description } = req.body;
  if (!pointName || !description) {
    return res.status(400).json({ success: false, error: "Nome do ponto e descrição do problema são necessários." });
  }

  const reportes = getReportesDB();
  const novoReporte: Reporte = {
    id: "rep-" + Date.now() + "-" + Math.floor(Math.random() * 1000000),
    pointId: Number(pointId) || 0,
    pointName: pointName.trim(),
    reporterLabel: reporterLabel ? reporterLabel.trim() : "Cidadão Anônimo",
    description: description.trim(),
    date: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    resolved: false
  };

  reportes.unshift(novoReporte);
  saveReportesDB(reportes);

  logConsulta(`[ALERTA DE PONTO] Novo reporte de inoperabilidade registrado para "${pointName}" por ${reporterLabel}. Motivo: ${description}`);
  return res.json({ success: true, report: novoReporte });
});

// Recuperar todos os alertas/reportes cadastrados
app.get("/api/admin/reports", (req, res) => {
  const reportes = getReportesDB();
  return res.json({ success: true, reports: reportes });
});

// Descartar/Resolver um alerta pelo coordenador administrativo
app.delete("/api/admin/reports/:id", (req, res) => {
  const { id } = req.params;
  const reportes = getReportesDB();
  const filtrados = reportes.filter(r => r.id !== id);

  if (reportes.length === filtrados.length) {
    return res.status(404).json({ success: false, error: "Alerta não encontrado no servidor." });
  }

  saveReportesDB(filtrados);
  logConsulta(`[REGISTRO EXCLUÍDO] Alerta de Ponto ID ${id} foi arquivado permanentemente.`);
  return res.json({ success: true });
});

// Histórico de logs industriais
app.get("/api/historico", (req, res) => {
  try {
    if (!fs.existsSync(LOG_PATH)) {
      return res.json({ logs: [] });
    }
    const data = fs.readFileSync(LOG_PATH, "utf-8");
    const logs = data.split("\n").filter(line => line.trim().length > 0).reverse(); // Ordena mais recente primeiro
    return res.json({ logs });
  } catch (err) {
    return res.status(500).json({ error: "Falha ao ler historico.txt" });
  }
});

// Banco de dados persistente de sugestões dos cidadãos
const SUGESTOES_DB_PATH = path.join(process.cwd(), "sugestoes_db.json");

interface Sugestao {
  id: string;
  senderName: string;
  senderCourse: string;
  senderEmail: string;
  suggestionText: string;
  date: string;
}

function getSugestoesDB(): Sugestao[] {
  try {
    if (!fs.existsSync(SUGESTOES_DB_PATH)) {
      return [];
    }
    const data = fs.readFileSync(SUGESTOES_DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Erro ao ler banco de dados de sugestões:", err);
    return [];
  }
}

function saveSugestoesDB(data: Sugestao[]) {
  try {
    fs.writeFileSync(SUGESTOES_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao salvar banco de sugestões:", err);
  }
}

// Submeter uma sugestão / feedback pelo cidadão
app.post("/api/sugestoes", (req, res) => {
  const { senderName, senderCourse, senderEmail, suggestionText } = req.body;
  if (!suggestionText || suggestionText.trim().length === 0) {
    return res.status(400).json({ success: false, error: "O texto da sugestão não pode ser vazio." });
  }

  const sugestoes = getSugestoesDB();
  const novaSugestao: Sugestao = {
    id: "sug-" + Date.now() + "-" + Math.floor(Math.random() * 1000000),
    senderName: senderName ? senderName.trim() : "Anônimo",
    senderCourse: senderCourse ? senderCourse.trim() : "Visitante",
    senderEmail: senderEmail ? senderEmail.trim() : "Não informado",
    suggestionText: suggestionText.trim(),
    date: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  };

  sugestoes.unshift(novaSugestao);
  saveSugestoesDB(sugestoes);

  logConsulta(`[SUGESTÃO RECEBIDA] Nova sugestão enviada por ${novaSugestao.senderName} (${novaSugestao.senderCourse}): ${novaSugestao.suggestionText.substring(0, 40)}...`);
  return res.json({ success: true, suggestion: novaSugestao });
});

// Administrador: Obter todas as sugestões
app.get("/api/admin/sugestoes", (req, res) => {
  const sugestoes = getSugestoesDB();
  return res.json({ success: true, suggestions: sugestoes });
});

// Administrador: Excluir/Arquivar uma sugestão
app.delete("/api/admin/sugestoes/:id", (req, res) => {
  const { id } = req.params;
  const sugestoes = getSugestoesDB();
  const filtradas = sugestoes.filter(s => s.id !== id);

  if (sugestoes.length === filtradas.length) {
    return res.status(404).json({ success: false, error: "Sugestão não encontrada." });
  }

  saveSugestoesDB(filtradas);
  logConsulta(`[REGISTRO EXCLUÍDO] Sugestão ID ${id} foi arquivada permanentemente pelo Administrador.`);
  return res.json({ success: true });
});

// --- BANCO DE DADOS DE PRODUTOS DE TROCA ---
function getProdutosDB(): ProdutoTroca[] {
  let list: ProdutoTroca[] = [];
  try {
    if (fs.existsSync(PRODUTOS_DB_PATH)) {
      const data = fs.readFileSync(PRODUTOS_DB_PATH, "utf-8");
      list = JSON.parse(data);
    } else {
      list = [
        {
          id: "prod-1",
          name: "Sacola Ecológica Reutilizável (EcoBag)",
          points: 10,
          stock: 50,
          description: "Sacola resistente de algodão orgânico cru, ideal para compras e feiras.",
          icon: "🛍️"
        },
        {
          id: "prod-2",
          name: "Caneca Ecológica de Fibra de Coco",
          points: 15,
          stock: 30,
          description: "Caneca durável feita a partir de resíduos de coco e plástico biodegradável.",
          icon: "🥤"
        },
        {
          id: "prod-3",
          name: "Sabão Caseiro Ecológico Artesanal",
          points: 8,
          stock: 25,
          description: "Feito a partir de óleo vegetal reciclado purificado. Produto 100% biodegradável.",
          icon: "🧼"
        },
        {
          id: "prod-4",
          name: "Kit de Sementes Hortaliças Orgânicas",
          points: 5,
          stock: 100,
          description: "Inclui sementes de rúcula, alface e cenoura para montar sua mini-horta urbana.",
          icon: "🌱"
        },
        {
          id: "prod-5",
          name: "Camiseta Algodão Orgânico Viver+Bio",
          points: 40,
          stock: 15,
          description: "Camiseta exclusiva de algodão orgânico cru com estampa sustentável.",
          icon: "👕"
        }
      ];
      fs.writeFileSync(PRODUTOS_DB_PATH, JSON.stringify(list, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Erro ao ler banco de dados de produtos:", err);
    list = [];
  }
  return list;
}

function saveProdutosDB(list: ProdutoTroca[]) {
  try {
    fs.writeFileSync(PRODUTOS_DB_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao salvar banco de dados de produtos:", err);
  }
}

// API: Obter produtos de troca
app.get("/api/produtos-troca", (req, res) => {
  const produtos = getProdutosDB();
  return res.json({ success: true, produtos });
});

// API: Adicionar novo produto de troca (Admin)
app.post("/api/produtos-troca", (req, res) => {
  const { name, points, stock, description, icon, imageUrl, redeemAddress } = req.body;
  if (!name || points === undefined || stock === undefined) {
    return res.status(400).json({ success: false, error: "Dados incompletos para cadastro do produto." });
  }

  const produtos = getProdutosDB();
  const newProduct: ProdutoTroca = {
    id: "prod-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    name: name.trim(),
    points: parseInt(points, 10) || 0,
    stock: parseInt(stock, 10) || 0,
    description: (description || "").trim(),
    icon: (icon || "🎁").trim(),
    imageUrl: (imageUrl || "").trim(),
    redeemAddress: (redeemAddress || "").trim()
  };

  produtos.push(newProduct);
  saveProdutosDB(produtos);

  logConsulta(`[PRODUTO ADICIONADO] Novo item de recompensa cadastrado: ${newProduct.name} por ${newProduct.points} pts.`);

  return res.json({ success: true, product: newProduct, produtos });
});

// API: Excluir produto de troca (Admin)
app.delete("/api/produtos-troca/:id", (req, res) => {
  const { id } = req.params;
  const produtos = getProdutosDB();
  const filtrados = produtos.filter(p => p.id !== id);

  if (produtos.length === filtrados.length) {
    return res.status(404).json({ success: false, error: "Produto não encontrado." });
  }

  saveProdutosDB(filtrados);
  logConsulta(`[PRODUTO EXCLUÍDO] Recompensa ID ${id} foi removida pelo Administrador.`);

  return res.json({ success: true, produtos: filtrados });
});

// API: Resgatar produto de troca (Usuário Comum)
app.post("/api/produtos-troca/resgatar", (req, res) => {
  const { token, productId } = req.body;
  if (!token || !token.startsWith("eco_usr_session_")) {
    return res.status(401).json({ success: false, error: "Sessão inválida ou expirada." });
  }

  const parts = token.split("_");
  const username = parts[3];
  if (!username) {
    return res.status(401).json({ success: false, error: "Token malformado." });
  }

  const usersDb = getUsersDB();
  const user = usersDb[username];
  if (!user) {
    return res.status(404).json({ success: false, error: "Usuário não encontrado." });
  }

  const produtos = getProdutosDB();
  const productIndex = produtos.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    return res.status(404).json({ success: false, error: "Produto indisponível ou não encontrado." });
  }

  const product = produtos[productIndex];
  if (product.stock <= 0) {
    return res.status(400).json({ success: false, error: "Desculpe, este produto está temporariamente esgotado!" });
  }

  if (user.stats.feiraVerdeCredits < product.points) {
    return res.status(400).json({ success: false, error: `Pontos insuficientes! Você precisa de ${product.points} EcoPontos, mas tem apenas ${user.stats.feiraVerdeCredits} pts.` });
  }

  // Deduzir estoque
  product.stock -= 1;
  produtos[productIndex] = product;
  saveProdutosDB(produtos);

  // Deduzir pontos do usuário e registrar a transação de resgate
  user.stats.feiraVerdeCredits -= product.points;

  const newRecord = {
    id: "red-" + Date.now() + "-" + Math.floor(Math.random() * 1000000),
    date: new Date().toLocaleDateString("pt-BR"),
    bairro: "Troca Efetuada",
    agua: 0,
    co2: 0,
    solo: 0,
    materias: 0,
    mercurio: 0,
    feiraVerde: -product.points,
    pontoConfirmado: `Resgate: ${product.name}`,
    residuo: "Resgate de Brinde",
    qty: 1,
    tipoRegistro: "troca"
  };

  user.savedSimulations = user.savedSimulations || [];
  user.savedSimulations.unshift(newRecord);

  usersDb[username] = user;
  saveUsersDB(usersDb);

  logConsulta(`[RESGATE EFETUADO] O usuário @${username} resgatou [${product.name}] por ${product.points} EcoPontos.`);

  const { passwordHash: _, ...publicUserData } = user;
  return res.json({ success: true, user: publicUserData, produtos });
});

// Login do Administrador via Hash MD5 com admin123
app.post("/api/login", (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.json({ auth: false, error: "Senha necessária" });
  }

  // Gera hash MD5
  const md5Hash = crypto.createHash("md5").update(password).digest("hex");
  // O hash de "admin123" é '0192023a7bbd73250516f069df18b500'
  if (md5Hash === "0192023a7bbd73250516f069df18b500") {
    return res.json({ auth: true, token: "admin_session_pg_" + Date.now() });
  }

  return res.json({ auth: false, error: "Senha de Administrador incorreta!" });
});


// Configuração do Vite middleware ou arquivos estáticos
async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[EcoRota+Impacto Server] Ativo em http://localhost:${PORT}`);
  });
}

startServer();
