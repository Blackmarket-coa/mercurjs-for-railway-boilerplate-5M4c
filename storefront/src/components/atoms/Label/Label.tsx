export const Label = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <span className='border rounded-sm py-2 px-3 label-sm'>
      {children}
    </span>
  );
};
