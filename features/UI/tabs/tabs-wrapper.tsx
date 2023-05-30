export const TabsWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-wrap bg-stone-800 mx-auto max-w-2xl mb-4 shadow-xl uppercase justify-around rounded-xl bg-opacity-60 min-w-[500px]">
      {children}
    </div>
  );
};
