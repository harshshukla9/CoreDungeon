import { FcGoogle as GoogleIcon } from 'react-icons/fc';

import { useAuthenticate } from '@account-kit/react';

import { Button } from './ui/button';

export const SignIn = () => {
  const { authenticate, isPending } = useAuthenticate();

  return (
    <Button
      className='flex h-12 flex-row items-center gap-2 rounded-xl font-medium [&_svg]:size-6'
      onClick={() => {
        authenticate({
          type: 'oauth',
          authProviderId: 'google',
          mode: 'redirect',
          redirectUrl: '/?start=true',
        });
      }}
    >
      <GoogleIcon size={100} />
      {isPending ? 'Signing in...' : 'Continue with Google'}
    </Button>
  );
};
