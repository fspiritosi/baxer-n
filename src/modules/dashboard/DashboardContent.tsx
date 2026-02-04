import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Users, FileText, Truck, TrendingUp } from 'lucide-react';

/**
 * Contenido del Dashboard
 *
 * Server Component - Renderiza métricas y widgets principales
 * Los datos aquí son mocks, se reemplazarán con datos reales de la BD
 */

// Mock de stats - En producción vendrán de server actions
const stats = [
  {
    title: 'Empleados Activos',
    value: '124',
    change: '+12%',
    changeType: 'positive' as const,
    icon: Users,
  },
  {
    title: 'Documentos',
    value: '1,234',
    change: '+8%',
    changeType: 'positive' as const,
    icon: FileText,
  },
  {
    title: 'Equipos',
    value: '56',
    change: '-2%',
    changeType: 'negative' as const,
    icon: Truck,
  },
  {
    title: 'Operaciones',
    value: '89',
    change: '+23%',
    changeType: 'positive' as const,
    icon: TrendingUp,
  },
];

export async function DashboardContent() {
  // TODO: Reemplazar con datos reales
  // const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al panel de control</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p
                className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change} desde el mes pasado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder para más contenido */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Aquí se mostrarán las actividades recientes...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tareas Pendientes</CardTitle>
            <CardDescription>Elementos que requieren atención</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Aquí se mostrarán las tareas pendientes...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
