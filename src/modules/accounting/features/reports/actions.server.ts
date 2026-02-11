'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/shared/lib/prisma';
import { logger } from '@/shared/lib/logger';
import { AccountNature, AccountType, JournalEntryStatus } from '@/generated/prisma/enums';
import {
  calculateAccountBalance,
  calculateAllAccountBalances,
  verifyAccountingEquation,
} from '../../shared/utils/balances';

interface AccountBalance {
  accountId: string;
  code: string;
  name: string;
  type: AccountType;
  nature: AccountNature;
  debitTotal: number;
  creditTotal: number;
  balance: number;
}

interface TrialBalanceResult {
  accounts: AccountBalance[];
  totalDebit: number;
  totalCredit: number;
  equation?: {
    isBalanced: boolean;
    assets: number;
    liabilities: number;
    equity: number;
    difference: number;
  };
}

interface JournalBookEntry {
  id: string;
  number: number;
  date: Date;
  description: string;
  status: JournalEntryStatus;
  lines: {
    id: string;
    accountId: string;
    description?: string | null;
    debit: number;
    credit: number;
    account: {
      code: string;
      name: string;
    };
  }[];
}

interface GeneralLedgerAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  nature: AccountNature;
  entries: {
    date: Date;
    description: string | null;
    debit: number;
    credit: number;
    balance: number;
    entryNumber: number;
  }[];
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

/**
 * Ajusta la fecha de fin para incluir todo el día
 */
function endOfDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Ajusta la fecha de inicio al comienzo del día
 */
function startOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Obtiene el balance de sumas y saldos
 */
export async function getTrialBalance(companyId: string, fromDate: Date, toDate: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  // Ajustar fechas para incluir todo el rango
  const from = startOfDay(fromDate);
  const to = endOfDay(toDate);

  try {
    logger.info('Obteniendo balance de sumas y saldos', { data: { companyId, from, to } });

    // Obtener todas las cuentas activas
    const accounts = await prisma.account.findMany({
      where: {
        companyId,
        isActive: true,
      },
      orderBy: { code: 'asc' },
    });

    // Usar la función de balances.ts para calcular saldos hasta la fecha final
    const balancesMap = await calculateAllAccountBalances(companyId, to);

    // Convertir a array y agregar información de cuentas
    const balances: AccountBalance[] = accounts
      .map(account => {
        const balance = balancesMap.get(account.id) || { debit: 0, credit: 0, balance: 0 };

        return {
          accountId: account.id,
          code: account.code,
          name: account.name,
          type: account.type,
          nature: account.nature,
          debitTotal: balance.debit,
          creditTotal: balance.credit,
          balance: balance.balance,
        };
      })
      // Filtrar cuentas sin movimientos
      .filter(account => account.debitTotal !== 0 || account.creditTotal !== 0);

    // Calcular totales
    const totalDebit = balances.reduce((sum, account) => sum + account.debitTotal, 0);
    const totalCredit = balances.reduce((sum, account) => sum + account.creditTotal, 0);

    // Verificar ecuación contable
    const equation = await verifyAccountingEquation(companyId, to);

    const result = {
      accounts: balances,
      totalDebit,
      totalCredit,
      equation,
    };

    logger.info('Balance calculado', {
      data: {
        accountCount: balances.length,
        totalDebit,
        totalCredit,
        equationBalanced: equation.isBalanced,
      }
    });

    if (!equation.isBalanced) {
      logger.warn('Balance desbalanceado detectado', {
        data: {
          difference: equation.difference,
          assets: equation.assets,
          liabilities: equation.liabilities,
          equity: equation.equity,
        }
      });
    }

    return result;
  } catch (error) {
    logger.error('Error al obtener balance de sumas y saldos', { data: { error, companyId, userId } });
    throw error;
  }
}

/**
 * Obtiene el libro diario
 */
export async function getJournalBook(companyId: string, fromDate: Date, toDate: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  // Ajustar fechas para incluir todo el rango
  const from = startOfDay(fromDate);
  const to = endOfDay(toDate);

  try {
    const entries = await prisma.journalEntry.findMany({
      where: {
        companyId,
        status: JournalEntryStatus.POSTED,
        date: {
          gte: from,
          lte: to,
        },
      },
      orderBy: [
        { date: 'asc' },
        { number: 'asc' },
      ],
      include: {
        lines: {
          include: {
            account: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return entries;
  } catch (error) {
    logger.error('Error al obtener libro diario', { data: { error, companyId, userId } });
    throw error;
  }
}

/**
 * Obtiene el libro mayor
 */
export async function getGeneralLedger(companyId: string, fromDate: Date, toDate: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  // Ajustar fechas para incluir todo el rango
  const from = startOfDay(fromDate);
  const to = endOfDay(toDate);

  try {
    // Obtener todas las cuentas activas
    const accounts = await prisma.account.findMany({
      where: {
        companyId,
        isActive: true,
      },
      orderBy: { code: 'asc' },
    });

    // Obtener todos los asientos registrados en el período
    const entries = await prisma.journalEntry.findMany({
      where: {
        companyId,
        status: JournalEntryStatus.POSTED,
        date: {
          gte: from,
          lte: to,
        },
      },
      orderBy: [
        { date: 'asc' },
        { number: 'asc' },
      ],
      include: {
        lines: true,
      },
    });

    // Procesar cada cuenta
    const ledger: GeneralLedgerAccount[] = accounts.map(account => {
      const movements = entries
        .filter(entry => entry.lines.some(line => line.accountId === account.id))
        .map(entry => {
          const line = entry.lines.find(line => line.accountId === account.id)!;
          return {
            date: entry.date,
            description: entry.description,
            entryNumber: entry.number,
            debit: line.debit,
            credit: line.credit,
          };
        });

      let balance = 0;
      const processedMovements = movements.map(movement => {
        const debit = Number(movement.debit);
        const credit = Number(movement.credit);
        
        // Actualizar balance según naturaleza de la cuenta
        if (account.nature === AccountNature.DEBIT) {
          balance += debit - credit;
        } else {
          balance += credit - debit;
        }

        return {
          date: movement.date,
          description: movement.description,
          debit,
          credit,
          balance,
          entryNumber: movement.entryNumber,
        };
      });

      const totalDebit = movements.reduce((sum, movement) => sum + Number(movement.debit), 0);
      const totalCredit = movements.reduce((sum, movement) => sum + Number(movement.credit), 0);
      const finalBalance = account.nature === AccountNature.DEBIT
        ? totalDebit - totalCredit
        : totalCredit - totalDebit;

      return {
        id: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        nature: account.nature,
        entries: processedMovements,
        totalDebit,
        totalCredit,
        balance: finalBalance,
      };
    });

    return ledger;
  } catch (error) {
    logger.error('Error al obtener libro mayor', { data: { error, companyId, userId } });
    throw error;
  }
}

/**
 * Balance General (Balance Sheet)
 */
interface BalanceSheetAccount {
  code: string;
  name: string;
  balance: number;
}

interface BalanceSheetSection {
  title: string;
  accounts: BalanceSheetAccount[];
  total: number;
}

interface BalanceSheetResult {
  assets: BalanceSheetSection;
  liabilities: BalanceSheetSection;
  equity: BalanceSheetSection;
  totalAssets: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  difference: number;
}

/**
 * Obtiene el Balance General (Balance Sheet)
 * Muestra: Activo = Pasivo + Patrimonio Neto
 */
export async function getBalanceSheet(companyId: string, asOfDate: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const date = endOfDay(asOfDate);

  try {
    logger.info('Generando Balance General', { data: { companyId, date } });

    // Obtener todas las cuentas activas
    const accounts = await prisma.account.findMany({
      where: {
        companyId,
        isActive: true,
      },
      orderBy: { code: 'asc' },
    });

    // Calcular saldos hasta la fecha
    const balancesMap = await calculateAllAccountBalances(companyId, date);

    // Agrupar por tipo
    const assets: BalanceSheetAccount[] = [];
    const liabilities: BalanceSheetAccount[] = [];
    const equity: BalanceSheetAccount[] = [];

    for (const account of accounts) {
      const balance = balancesMap.get(account.id);
      if (!balance || balance.balance === 0) continue;

      const accountData: BalanceSheetAccount = {
        code: account.code,
        name: account.name,
        balance: balance.balance,
      };

      switch (account.type) {
        case AccountType.ASSET:
          assets.push(accountData);
          break;
        case AccountType.LIABILITY:
          liabilities.push(accountData);
          break;
        case AccountType.EQUITY:
          equity.push(accountData);
          break;
        // REVENUE y EXPENSE no van en el Balance General
      }
    }

    // Calcular totales
    const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.balance, 0);
    const totalEquity = equity.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    const result: BalanceSheetResult = {
      assets: {
        title: 'Activo',
        accounts: assets,
        total: totalAssets,
      },
      liabilities: {
        title: 'Pasivo',
        accounts: liabilities,
        total: totalLiabilities,
      },
      equity: {
        title: 'Patrimonio Neto',
        accounts: equity,
        total: totalEquity,
      },
      totalAssets,
      totalLiabilitiesAndEquity,
      isBalanced: Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01,
      difference: totalAssets - totalLiabilitiesAndEquity,
    };

    logger.info('Balance General generado', {
      data: {
        totalAssets,
        totalLiabilitiesAndEquity,
        isBalanced: result.isBalanced,
      }
    });

    if (!result.isBalanced) {
      logger.warn('Balance General desbalanceado', {
        data: { difference: result.difference }
      });
    }

    return result;
  } catch (error) {
    logger.error('Error al generar Balance General', { data: { error, companyId, userId } });
    throw error;
  }
}

/**
 * Estado de Resultados (Income Statement)
 */
interface IncomeStatementAccount {
  code: string;
  name: string;
  amount: number;
}

interface IncomeStatementSection {
  title: string;
  accounts: IncomeStatementAccount[];
  total: number;
}

interface IncomeStatementResult {
  revenue: IncomeStatementSection;
  expenses: IncomeStatementSection;
  grossProfit: number;
  netIncome: number;
}

/**
 * Obtiene el Estado de Resultados (Income Statement)
 * Muestra: Ingresos - Gastos = Resultado del Período
 */
export async function getIncomeStatement(companyId: string, fromDate: Date, toDate: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const from = startOfDay(fromDate);
  const to = endOfDay(toDate);

  try {
    logger.info('Generando Estado de Resultados', { data: { companyId, from, to } });

    // Obtener cuentas de ingresos y gastos
    const accounts = await prisma.account.findMany({
      where: {
        companyId,
        isActive: true,
        type: {
          in: [AccountType.REVENUE, AccountType.EXPENSE],
        },
      },
      orderBy: { code: 'asc' },
    });

    // Calcular movimientos en el período
    const entries = await prisma.journalEntry.findMany({
      where: {
        companyId,
        status: JournalEntryStatus.POSTED,
        date: {
          gte: from,
          lte: to,
        },
      },
      include: {
        lines: true,
      },
    });

    // Calcular saldos por cuenta en el período
    const revenue: IncomeStatementAccount[] = [];
    const expenses: IncomeStatementAccount[] = [];

    for (const account of accounts) {
      const movements = entries.flatMap(entry => entry.lines)
        .filter(line => line.accountId === account.id);

      if (movements.length === 0) continue;

      const debitTotal = movements.reduce((sum, line) => sum + Number(line.debit), 0);
      const creditTotal = movements.reduce((sum, line) => sum + Number(line.credit), 0);

      // Para ingresos (REVENUE): crédito aumenta, débito disminuye
      // Para gastos (EXPENSE): débito aumenta, crédito disminuye
      const amount = account.type === AccountType.REVENUE
        ? creditTotal - debitTotal
        : debitTotal - creditTotal;

      if (amount === 0) continue;

      const accountData: IncomeStatementAccount = {
        code: account.code,
        name: account.name,
        amount,
      };

      if (account.type === AccountType.REVENUE) {
        revenue.push(accountData);
      } else {
        expenses.push(accountData);
      }
    }

    // Calcular totales
    const totalRevenue = revenue.reduce((sum, acc) => sum + acc.amount, 0);
    const totalExpenses = expenses.reduce((sum, acc) => sum + acc.amount, 0);
    const netIncome = totalRevenue - totalExpenses;

    const result: IncomeStatementResult = {
      revenue: {
        title: 'Ingresos',
        accounts: revenue,
        total: totalRevenue,
      },
      expenses: {
        title: 'Gastos',
        accounts: expenses,
        total: totalExpenses,
      },
      grossProfit: totalRevenue,
      netIncome,
    };

    logger.info('Estado de Resultados generado', {
      data: {
        totalRevenue,
        totalExpenses,
        netIncome,
      }
    });

    return result;
  } catch (error) {
    logger.error('Error al generar Estado de Resultados', { data: { error, companyId, userId } });
    throw error;
  }
}
