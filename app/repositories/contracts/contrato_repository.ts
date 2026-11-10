import type { DateTime } from 'luxon'

import type Contrato from '#models/contrato'
import type Lancamento from '#models/lancamento'
import type { TipoParcelamento } from '#models/contrato'
import type { LancamentoData, ParcelaData } from '#repositories/contracts/lancamento_repository'

export interface ContratoData {
  imovelId: number
  clienteNome: string
  clienteCpf?: string | null
  clienteTelefone?: string | null
  valorAluguel: number
  tipoParcelamento: TipoParcelamento
  dataInicio: DateTime
  dataFim: DateTime
  diaVencimento: number
  qtdMeses: number
  qtdParcelas: number
}

export default abstract class ContratoRepository {
  abstract listForUser(userId: number): Promise<Contrato[]>
  abstract findForUser(userId: number, id: number): Promise<Contrato>
  /** Cria o contrato e o lançamento de receita com suas parcelas, atomicamente. */
  abstract create(
    userId: number,
    data: ContratoData,
    lancamento: LancamentoData,
    parcelas: ParcelaData[]
  ): Promise<Contrato>
  /** Atualiza o contrato e regera o lançamento/parcelas vinculados. */
  abstract update(
    contrato: Contrato,
    data: ContratoData,
    lancamento: LancamentoData,
    parcelas: ParcelaData[]
  ): Promise<Contrato>
  abstract delete(contrato: Contrato): Promise<void>
  /** Rescinde o contrato: cancela o lançamento vinculado e suas parcelas pendentes. */
  abstract desativar(contrato: Contrato): Promise<Contrato>
  /** Lançamento gerado pelo contrato, com parcelas (null se não existir). */
  abstract findLancamentoVinculado(contratoId: number): Promise<Lancamento | null>
  abstract existsForImovel(imovelId: number): Promise<boolean>
}
