import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => (
    <div className="app-bg min-h-screen grid place-items-center">
      <div className="text-center">
        <div className="font-display text-7xl font-bold text-gradient">404</div>
        <p className="mono mt-2 text-sm text-muted-foreground">SIGNAL LOST</p>
        <a
          href="/dashboard"
          className="mt-4 inline-block rounded-xl bg-primary px-4 py-2 text-primary-foreground"
        >
          Return to Command
        </a>
      </div>
    </div>
  ),
});
