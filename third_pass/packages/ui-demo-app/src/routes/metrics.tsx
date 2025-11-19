import { createFileRoute } from '@tanstack/react-router'
import {
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

export const Route = createFileRoute('/metrics')({
  component: MetricsPage,
})

// Mock data - will be replaced with actual pipeline metrics
const mockMetrics = {
  totalGenerations: 127,
  successRate: 94.5,
  avgLatency: 3.2,
  totalCost: 45.67,
  trends: {
    generations: 12,
    successRate: 2.3,
    latency: -0.5,
    cost: 5.2,
  },
}

const recentGenerations = [
  {
    id: '1',
    component: 'PrimaryButton',
    status: 'success',
    latency: 2.8,
    cost: 0.15,
    timestamp: '2025-11-11T10:30:00Z',
  },
  {
    id: '2',
    component: 'LoginForm',
    status: 'success',
    latency: 4.5,
    cost: 0.32,
    timestamp: '2025-11-11T10:25:00Z',
  },
  {
    id: '3',
    component: 'DashboardCard',
    status: 'warning',
    latency: 5.2,
    cost: 0.41,
    timestamp: '2025-11-11T10:20:00Z',
  },
  {
    id: '4',
    component: 'NavigationMenu',
    status: 'success',
    latency: 3.1,
    cost: 0.22,
    timestamp: '2025-11-11T10:15:00Z',
  },
  {
    id: '5',
    component: 'UserAvatar',
    status: 'error',
    latency: 8.3,
    cost: 0.65,
    timestamp: '2025-11-11T10:10:00Z',
  },
]

function MetricsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pipeline Metrics</h1>
        <p className="text-muted-foreground">
          Monitor performance, accuracy, and costs of the component generation
          pipeline
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Generations"
          value={mockMetrics.totalGenerations.toString()}
          trend={mockMetrics.trends.generations}
          icon={<CheckCircle className="w-5 h-5" />}
          color="blue"
        />
        <MetricCard
          title="Success Rate"
          value={`${mockMetrics.successRate}%`}
          trend={mockMetrics.trends.successRate}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
        <MetricCard
          title="Avg. Latency"
          value={`${mockMetrics.avgLatency}s`}
          trend={mockMetrics.trends.latency}
          icon={<Clock className="w-5 h-5" />}
          color="orange"
          invertTrend
        />
        <MetricCard
          title="Total Cost"
          value={`$${mockMetrics.totalCost}`}
          trend={mockMetrics.trends.cost}
          icon={<DollarSign className="w-5 h-5" />}
          color="purple"
          invertTrend
        />
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Generations Over Time
          </h2>
          <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
            <span className="text-muted-foreground">Chart Placeholder</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Success Rate Trend</h2>
          <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
            <span className="text-muted-foreground">Chart Placeholder</span>
          </div>
        </div>
      </div>

      {/* Recent Generations Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Recent Generations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Component
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Latency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentGenerations.map((generation) => (
                <GenerationRow key={generation.id} generation={generation} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  trend: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'orange' | 'purple'
  invertTrend?: boolean
}

function MetricCard({
  title,
  value,
  trend,
  icon,
  color,
  invertTrend = false,
}: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600',
    green: 'bg-green-500/10 text-green-600',
    orange: 'bg-orange-500/10 text-orange-600',
    purple: 'bg-purple-500/10 text-purple-600',
  }

  const isPositiveTrend = invertTrend ? trend < 0 : trend > 0
  const trendColor = isPositiveTrend ? 'text-green-600' : 'text-red-600'

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
          {isPositiveTrend ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>
      <h3 className="text-sm text-muted-foreground mb-1">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}

interface GenerationRowProps {
  generation: {
    id: string
    component: string
    status: string
    latency: number
    cost: number
    timestamp: string
  }
}

function GenerationRow({ generation }: GenerationRowProps) {
  const statusConfig = {
    success: {
      color: 'bg-green-500/10 text-green-600 border-green-500/20',
      icon: <CheckCircle className="w-4 h-4" />,
    },
    warning: {
      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      icon: <AlertCircle className="w-4 h-4" />,
    },
    error: {
      color: 'bg-red-500/10 text-red-600 border-red-500/20',
      icon: <AlertCircle className="w-4 h-4" />,
    },
  }

  const config = statusConfig[generation.status as keyof typeof statusConfig]

  return (
    <tr className="hover:bg-muted/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap font-medium">
        {generation.component}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${config.color}`}
        >
          {config.icon}
          {generation.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {generation.latency}s
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        ${generation.cost.toFixed(2)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
        {new Date(generation.timestamp).toLocaleString()}
      </td>
    </tr>
  )
}
