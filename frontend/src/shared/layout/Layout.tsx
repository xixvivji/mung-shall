type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
