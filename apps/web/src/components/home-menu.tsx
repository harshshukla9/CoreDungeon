import { useState } from 'react';
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { cn } from '~/lib/utils';

// import { useLogout, useUser } from '@account-kit/react';
import { useNavigate } from '@tanstack/react-router';



export const HomeMenu = () => {
 // const user = useUser();
 // const { logout } = useLogout();
  const navigate = useNavigate();

  const items = [
    {
      name: 'Play',
      key: 'play',
      onClick: () =>
        navigate({
          to: '/game',
        }),
    },
    {
      name: 'Profile',
      key: 'profile',
      onClick: () =>
        navigate({
          to: '/profile',
        }),
    },
    {
      name: 'Settings',
      key: 'settings',
      onClick: () => true,
    },
  ];

  const [hovered, setHovered] = useState<string | null>(null);

  //if (!user) return <SignIn />;
  return (
    <div className='flex translate-y-12 flex-col items-center'>
      <div className='py-2 font-golondrina text-2xl tracking-wide transition-all duration-200 ease-in-out opacity-77'>
       <ConnectButton/>
      </div>
      {items.map((item) => (
        <button
          key={item.key}
          type='button'
          className={cn(
            'py-2 font-golondrina text-5xl tracking-wide transition-all duration-200 ease-in-out',
            (hovered ?? 'play') === item.key
              ? 'scale-[108%] text-neutral-100'
              : 'scale-100 text-neutral-300'
          )}
          onClick={item.onClick}
          onMouseEnter={() => setHovered(item.key)}
          onMouseLeave={() => setHovered(null)}
        >
          {item.name}
        </button>
       
        
      ))}
      
    </div>
  );
};
