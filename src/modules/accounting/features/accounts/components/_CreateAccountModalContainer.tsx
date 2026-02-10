'use client';

import { useState, useEffect } from 'react';
import { _CreateAccountModal } from './_CreateAccountModal';

interface CreateAccountModalContainerProps {
  companyId: Promise<string>;
  onClose: () => void;
}

export function _CreateAccountModalContainer({ companyId, onClose }: CreateAccountModalContainerProps) {
  const [resolvedCompanyId, setResolvedCompanyId] = useState<string | null>(null);

  useEffect(() => {
    companyId.then(id => setResolvedCompanyId(id));
  }, [companyId]);

  return resolvedCompanyId ? (
    <_CreateAccountModal
      companyId={resolvedCompanyId}
      onClose={onClose}
    />
  ) : null;
}
