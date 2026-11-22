import type { Cenario } from '../motor/tipos';
import { boiNaNuvem } from './boi_na_nuvem';
import { pinhaoForte } from './pinhao_forte';
import { bomSossego } from './bom_sossego';
import { peDeMoleque } from './pe_de_moleque';

export const cenarios: Cenario[] = [
  boiNaNuvem,
  pinhaoForte,
  bomSossego,
  peDeMoleque,
];

export const rotuloNivel: Record<Cenario['nivel'], string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  expert: 'Expert',
  extra: 'Extra expert',
};
