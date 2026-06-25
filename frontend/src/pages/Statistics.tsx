import { getStats, fraudCases } from "@/data/fraudCases";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import { TrendingUp, Users, Globe, Building2 } from "lucide-react";

const COLORS = ['hsl(215, 80%, 35%)', 'hsl(200, 75%, 45%)', 'hsl(0, 72%, 51%)', 'hsl(38, 92%, 50%)', 'hsl(142, 76%, 36%)', 'hsl(270, 60%, 50%)'];

export default function Statistics() {
  const stats = getStats();

  const nationalityData = Object.entries(stats.nationalities)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const originData = Object.entries(stats.origins)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const destinationData = Object.entries(stats.destinations)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const fraudTypeData = Object.entries(stats.fraudTypes)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const monthlyData = Object.entries(stats.monthlyStats).map(([month, count]) => ({
    month: month.split('-')[1] === '04' ? 'Avril' : month.split('-')[1] === '05' ? 'Mai' : 'Juin',
    cas: count
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Statistiques</h1>
        <p className="mt-1 text-muted-foreground">
          Analyse approfondie des données de fraude documentaire
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cas total</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalCases}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
            <Users className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Passagers</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalPassengers}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
            <Globe className="h-6 w-6 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Nationalités</p>
            <p className="text-2xl font-bold text-foreground">{Object.keys(stats.nationalities).length}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
            <Building2 className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Origines</p>
            <p className="text-2xl font-bold text-foreground">{Object.keys(stats.origins).length}</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trend Over Time */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Tendance mensuelle</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorCas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(215, 80%, 35%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(215, 80%, 35%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                <Area 
                  type="monotone" 
                  dataKey="cas" 
                  stroke="hsl(215, 80%, 35%)" 
                  fillOpacity={1} 
                  fill="url(#colorCas)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fraud Types */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Répartition par type de fraude</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fraudTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
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
        </div>

        {/* Destinations */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Cas par destination</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destinationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" width={100} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="value" fill="hsl(200, 75%, 45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nationalities */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top nationalités</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nationalityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="value" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Origins Breakdown */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Répartition par société d'origine</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {originData.map((origin, index) => (
            <div key={origin.name} className="rounded-lg border border-border p-4 text-center">
              <div 
                className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}
              >
                <span 
                  className="text-lg font-bold"
                  style={{ color: COLORS[index % COLORS.length] }}
                >
                  {origin.value}
                </span>
              </div>
              <p className="font-medium text-foreground">{origin.name}</p>
              <p className="text-sm text-muted-foreground">
                {Math.round((origin.value / stats.totalPassengers) * 100)}% du total
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
