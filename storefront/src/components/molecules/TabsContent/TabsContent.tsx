export const TabsContent = ({
  children,
  value,
  activeTab,
}: {
  children: React.ReactNode;
  value: string;
  activeTab: string;
}) => {
  if (activeTab !== value) return null;

  return <div>{children}</div>;
};
