export const LoadingOverlay = () => {
  return (
    <div className='!m-0 !p-0'>
      <img
        alt='background'
        className='absolute h-screen w-full'
        src='/background.png'
      />
      <div className='absolute top-[18%] right-1/2 z-[1] translate-x-1/2'>
        <img alt='logo' className='max-w-2xl' src='/logo.png' />
      </div>
      <div className='absolute right-1/2 bottom-[20%] z-[1] translate-x-1/2'>
        <div className='font-golondrina text-5xl'>Loading...</div>
      </div>
    </div>
  );
};
