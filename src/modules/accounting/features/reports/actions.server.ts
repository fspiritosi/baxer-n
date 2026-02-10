'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/shared/lib/prisma';
import { logger } from '@/shared/lib/logger';
import { AccountNature, AccountType, JournalEntryStatus } from '@/generated/prisma/enums';

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
      include: {
        lines: true,
      },
    });

    logger.info('Asientos encontrados', { 
      data: { 
        count: entries.length,
        lines: entries.flatMap(e => e.lines).length,
      } 
    });

    // Calcular saldos por cuenta
    const balances: AccountBalance[] = accounts.map(account => {
      const movements = entries.flatMap(entry => entry.lines)
        .filter(line => line.accountId === account.id);

      const debitTotal = movements.reduce((sum, line) => sum + Number(line.debit), 0);
      const creditTotal = movements.reduce((sum, line) => sum + Number(line.credit), 0);

      // El saldo depende de la naturaleza de la cuenta
      const balance = account.nature === AccountNature.DEBIT
        ? debitTotal - creditTotal
        : creditTotal - debitTotal;

      return {
        accountId: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        nature: account.nature,
        debitTotal,
        creditTotal,
        balance,
      };
    });

    // Calcular totales
    const totalDebit = balances.reduce((sum, account) => sum + account.debitTotal, 0);
    const totalCredit = balances.reduce((sum, account) => sum + account.creditTotal, 0);

    const result = {
      accounts: balances,
      totalDebit,
      totalCredit,
    };

    logger.info('Balance calculado', { 
      data: { 
        accountCount: balances.length,
        totalDebit,
        totalCredit,
      } 
    });

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
