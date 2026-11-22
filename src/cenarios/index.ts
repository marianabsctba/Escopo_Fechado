import type { Cenario } from '../motor/tipos';
import { boiNaNuvem } from './boi_na_nuvem';
import { pinhaoForte } from './pinhao_forte';

export const cenarios: Cenario[] = [
  boiNaNuvem,
  pinhaoForte,
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
