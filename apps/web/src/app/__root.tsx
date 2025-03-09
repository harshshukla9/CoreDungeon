import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { ProviderTree } from '~/providers';

import '../styles/globals.css';

const RootComponent = () => {
  return (
    <>
      {import.meta.env.MODE === 'development' && (
        <TanStackRouterDevtools position='bottom-right' />
      )}
      <ProviderTree>
        <Outlet />
      </ProviderTree>
    </>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
