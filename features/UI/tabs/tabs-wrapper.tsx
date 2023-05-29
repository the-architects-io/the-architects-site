export const TabsWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-wrap bg-stone-300 mx-auto max-w-2xl mb-4 shadow-xl uppercase justify-around rounded-2xl bg-opacity-60 p-2 min-w-[500px]">
      {children}
    </div>
  );
};
