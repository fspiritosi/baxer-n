import { BookOpen } from 'lucide-react';

import { _HelpGuideTabs } from './components/_HelpGuideTabs';

export default function HelpGuide() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Guía de Usuario</h1>
          <p className="text-muted-foreground">
            Aprende a utilizar cada módulo del sistema paso a paso
          </p>
        </div>
      </div>
      <_HelpGuideTabs />
    </div>
  );
}
