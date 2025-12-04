export const Dropdown = ({
  children,
  show,
}: {
  children: React.ReactNode;
  show: boolean;
}) => {
  if (!show) return null;

  return (
    <div className='absolute -right-2 bg-primary text-primary z-20 border border-primary rounded-sm w-max'>
      {children}
    </div>
  );
};
