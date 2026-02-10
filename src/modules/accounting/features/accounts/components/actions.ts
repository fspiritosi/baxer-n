'use server';

import { createAccount as createAccountAction } from '../actions.server';
import { type CreateAccountInput } from '../../../shared/types';

export async function createAccountFromForm(params: { companyId: string, input: CreateAccountInput }) {
  return createAccountAction(params);
}
