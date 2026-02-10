'use client';

import { Button } from '@/shared/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { _CreateEntryModal } from './_CreateEntryModal';

export function _CreateEntryButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button onClick={() => setShowModal(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Asiento
      </Button>

      {showModal && (
        <_CreateEntryModal
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
