export interface PontoColeta {
  id: number;
  empresa: string;
  endereco: string;
  cep: string;
  bairro: string;
  tipo: string;
  aprovado: number;
  direcoesTexto?: string;
}

export interface Impactos {
  aguaProtegida: number;
  feiraVerdeCredits: number;
  soloProtegido: number;
  metaisRetidosPilhas: number;
  plasticoRecuperado: number;
  aluminioRecuperado: number;
  co2EvitadoLixo: number;
  metaisRecuperadosLixo: number;
  mercurioIsolado: number;
}

export interface RotaSugerida {
  residuo: string;
  nivelBusca: string;
  pontos: PontoColeta[];
}

export interface CalculoResultado {
  bairroResolvido: string;
  impactos: Impactos;
  rotasSugeridas: RotaSugerida[];
}
