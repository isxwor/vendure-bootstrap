import { defineDashboardExtension } from '@vendure/dashboard';

export default defineDashboardExtension({
  login: {
    beforeForm: {
      component: () => (
        <div className="text-center">
          <h1 className="text-2xl font-medium">Welcome back!</h1>
          <p className="text-muted-foreground text-balance">Login to your Vendure Bootstrap store</p>
        </div>
      ),
    },
  },
});
