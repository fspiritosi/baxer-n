'use client';

import { Building2, CreditCard, DollarSign, Calendar } from 'lucide-react';
import moment from 'moment';

import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { BANK_ACCOUNT_TYPE_LABELS, BANK_ACCOUNT_STATUS_LABELS, BANK_ACCOUNT_STATUS_BADGES } from '../../../../shared/validators';

interface Props {
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountType: string;
    cbu: string | null;
    alias: string | null;
    currency: string;
    balance: number;
    status: string;
    createdAt: Date;
  };
}

export function _BankAccountSummary({ bankAccount }: Props) {
  const isNegative = bankAccount.balance < 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Bank Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Banco</span>
          </div>
          <div className="font-semibold">{bankAccount.bankName}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {BANK_ACCOUNT_TYPE_LABELS[bankAccount.accountType as keyof typeof BANK_ACCOUNT_TYPE_LABELS]}
          </div>
        </CardContent>
      </Card>

      {/* Account Number */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Número de Cuenta</span>
          </div>
          <div className="font-mono font-semibold">{bankAccount.accountNumber}</div>
          {bankAccount.alias && (
            <div className="text-sm text-muted-foreground mt-1">{bankAccount.alias}</div>
          )}
        </CardContent>
      </Card>

      {/* Balance */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Saldo Actual</span>
          </div>
          <div className={`text-2xl font-bold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
            ${bankAccount.balance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-muted-foreground mt-1">{bankAccount.currency}</div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Estado</span>
          </div>
          <div className="mb-2">
            <Badge variant={BANK_ACCOUNT_STATUS_BADGES[bankAccount.status as keyof typeof BANK_ACCOUNT_STATUS_BADGES]}>
              {BANK_ACCOUNT_STATUS_LABELS[bankAccount.status as keyof typeof BANK_ACCOUNT_STATUS_LABELS]}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Creada {moment(bankAccount.createdAt).format('DD/MM/YYYY')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
