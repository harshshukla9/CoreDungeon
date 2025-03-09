import { createFileRoute } from '@tanstack/react-router';
import { ProfileDetails } from '~/components';

export const ProfileComponent = () => {
  return (
    <div className='!m-0 !p-0'>
      <img
        alt='background'
        className='absolute h-screen w-full'
        src='/background.png'
      />
      <ProfileDetails />
    </div>
  );
};

export const Route = createFileRoute('/profile')({
  component: ProfileComponent,
});
