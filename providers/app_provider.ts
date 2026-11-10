import type { ApplicationService } from '@adonisjs/core/types'

import CaixaRepository from '#repositories/contracts/caixa_repository'
import ContratoRepository from '#repositories/contracts/contrato_repository'
import ImovelRepository from '#repositories/contracts/imovel_repository'
import LancamentoRepository from '#repositories/contracts/lancamento_repository'
import PasswordResetTokenRepository from '#repositories/contracts/password_reset_token_repository'
import UserRepository from '#repositories/contracts/user_repository'
import LucidCaixaRepository from '#repositories/lucid/caixa_repository'
import LucidContratoRepository from '#repositories/lucid/contrato_repository'
import LucidImovelRepository from '#repositories/lucid/imovel_repository'
import LucidLancamentoRepository from '#repositories/lucid/lancamento_repository'
import LucidPasswordResetTokenRepository from '#repositories/lucid/password_reset_token_repository'
import LucidUserRepository from '#repositories/lucid/user_repository'

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.bind(UserRepository, () => new LucidUserRepository())
    this.app.container.bind(ImovelRepository, () => new LucidImovelRepository())
    this.app.container.bind(LancamentoRepository, () => new LucidLancamentoRepository())
    this.app.container.bind(CaixaRepository, () => new LucidCaixaRepository())
    this.app.container.bind(ContratoRepository, () => new LucidContratoRepository())
    this.app.container.bind(
      PasswordResetTokenRepository,
      () => new LucidPasswordResetTokenRepository()
    )
  }
}
