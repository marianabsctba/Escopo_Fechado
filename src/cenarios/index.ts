import type { Cenario } from '../motor/tipos';
import { boiNaNuvem } from './boi_na_nuvem';
import { pinhaoForte } from './pinhao_forte';
import { bomSossego } from './bom_sossego';

export const cenarios: Cenario[] = [
  boiNaNuvem,
  pinhaoForte,
  bomSossego,
];

export const rotuloNivel: Record<Cenario['nivel'], string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  expert: 'Expert',
};
