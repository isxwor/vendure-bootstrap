import { defineDashboardExtension, Trans } from '@vendure/dashboard';

export default defineDashboardExtension({
  login: {
    logo: {
      component: () => (
        <div>
          <h1 className="text-2xl font-medium">
            <Trans>Welcome back!</Trans>
          </h1>
          <p className="text-muted-foreground text-balance">Login to your Vendure Bootstrap store</p>
        </div>
      ),
    },
  },
});
