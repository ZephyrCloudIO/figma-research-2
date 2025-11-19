import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Layout, TestTube2, BarChart3, Code2 } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Zephyr UI Demo
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Showcase and validate Figma-generated components with visual
            regression testing, metrics tracking, and live code editing.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <FeatureCard
            icon={<Layout className="w-6 h-6" />}
            title="Figma Exports"
            description="View all Figma exports with side-by-side comparison, generated components, and full JSON structure"
            link="/exports"
          />
          <FeatureCard
            icon={<Code2 className="w-6 h-6" />}
            title="Code Playground"
            description="Experiment with generated code in a live editor environment"
            link="/playground"
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Metrics Dashboard"
            description="Monitor pipeline performance, latency, accuracy, and costs"
            link="/metrics"
          />
        </div>

        {/* Quick Stats */}
        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Pipeline Statistics
          </h2>
          <div className="grid grid-cols-3 gap-6 text-center">
            <StatItem label="Components Generated" value="0" />
            <StatItem label="Avg. Generation Time" value="0s" />
            <StatItem label="Success Rate" value="0%" />
          </div>
        </div>
      </div>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  link: string
}

function FeatureCard({ icon, title, description, link }: FeatureCardProps) {
  return (
    <a
      href={link}
      className="block bg-card border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-lg transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">{icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          <div className="flex items-center text-sm text-primary">
            Explore
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </a>
  )
}

interface StatItemProps {
  label: string
  value: string
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div>
      <div className="text-3xl font-bold text-primary mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
