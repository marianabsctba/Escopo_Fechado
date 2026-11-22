import type { Cenario } from '../motor/tipos';
import { boiNaNuvem } from './boi_na_nuvem';

export const cenarios: Cenario[] = [
  boiNaNuvem,
  {
    id: 'pinhao_forte',
    nome: 'Pinhão Forte',
    nivel: 'intermediario',
    local: 'Cooperativa de crédito no Paraná',
    chamada: 'Lançou um app "igual banco digital" feito por uma fábrica de software terceirizada. O gerente acha que segurança é o cadeado do navegador.',
    disponivel: false,
  },
  {
    id: 'bom_sossego',
    nome: 'São Jerônimo do Bom Sossego',
    nivel: 'expert',
    local: 'Prefeitura no sertão',
    chamada: 'Ano eleitoral, Active Directory montado em 2009 e um secretário de TI que é primo do vice-prefeito.',
    disponivel: false,
  },
];

export const rotuloNivel: Record<Cenario['nivel'], string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  expert: 'Expert',
};
