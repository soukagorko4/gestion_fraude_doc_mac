import { StatCard } from "@/components/StatCard";
import { CasesTable } from "@/components/CasesTable";
import { fraudCases, getStats } from "@/data/fraudCases";
import { 
  Users, 
  FileWarning, 
  Plane, 
  TrendingUp,
  AlertTriangle,
  MapPin
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['hsl(215, 80%, 35%)', 'hsl(200, 75%, 45%)', 'hsl(0, 72%, 51%)', 'hsl(38, 92%, 50%)', 'hsl(142, 76%, 36%)'];

export default function Dashboard() {
  const stats = getStats();
  
  const monthlyData = Object.entries(stats.monthlyStats).map(([month, count]) => ({
    month: month.split('-')[1] === '04' ? 'Avril' : month.split('-')[1] === '05' ? 'Mai' : 'Juin',
    cas: count
  }));

  const fraudTypeData = Object.entries(stats.fraudTypes)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const topDestinations = Object.entries(stats.destinations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
        <p className="mt-1 text-muted-foreground">
          Vue d'ensemble des fraudes documentaires - T2 2025
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total des cas"
          value={stats.totalCases}
          subtitle="Dossiers enregistrés"
          icon={FileWarning}
          variant="primary"
        />
        <StatCard
          title="Passagers impliqués"
          value={stats.totalPassengers}
          subtitle="Personnes concernées"
          icon={Users}
          variant="destructive"
        />
        <StatCard
          title="Destinations touchées"
          value={Object.keys(stats.destinations).length}
          subtitle="Villes différentes"
          icon={MapPin}
          variant="warning"
        />
        <StatCard
          title="Sociétés d'origine"
          value={Object.keys(stats.origins).length}
          subtitle="Entités déclarantes"
          icon={Plane}
          variant="default"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trend */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Évolution mensuelle</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="cas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fraud Types */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Types de fraude</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fraudTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {fraudTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            {fraudTypeData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Destinations & Gender */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top destinations</h3>
          <div className="space-y-3">
            {topDestinations.map(([destination, count], index) => (
              <div key={destination} className="flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">{destination}</span>
                    <span className="text-sm text-muted-foreground">{count} passagers</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${(count / topDestinations[0][1]) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Répartition par sexe</h3>
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-8">
              <div className="text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-2xl font-bold text-primary">{stats.maleCount}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-muted-foreground">Hommes</p>
              </div>
              <div className="text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
                  <span className="text-2xl font-bold text-accent">{stats.femaleCount}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-muted-foreground">Femmes</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {Math.round((stats.maleCount / stats.totalPassengers) * 100)}% hommes / {Math.round((stats.femaleCount / stats.totalPassengers) * 100)}% femmes
            </p>
          </div>
        </div>
      </div>

      {/* Recent Cases */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Derniers cas enregistrés</h3>
          <a href="/cases" className="text-sm font-medium text-primary hover:underline">
            Voir tout →
          </a>
        </div>
        <CasesTable cases={[...fraudCases].reverse()} limit={5} />
      </div>
    </div>
  );
}
