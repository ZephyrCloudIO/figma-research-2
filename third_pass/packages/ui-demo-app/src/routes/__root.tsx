import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-foreground">
              Zephyr UI Demo
            </Link>
            <div className="flex gap-6">
              <Link
                to="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                activeProps={{
                  className: 'text-foreground font-semibold',
                }}
              >
                Home
              </Link>
              <Link
                to="/exports"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                activeProps={{
                  className: 'text-foreground font-semibold',
                }}
              >
                Exports
              </Link>
              <Link
                to="/playground"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                activeProps={{
                  className: 'text-foreground font-semibold',
                }}
              >
                Playground
              </Link>
              <Link
                to="/metrics"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                activeProps={{
                  className: 'text-foreground font-semibold',
                }}
              >
                Metrics
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
