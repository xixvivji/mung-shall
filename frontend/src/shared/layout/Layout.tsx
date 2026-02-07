type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="mx-auto max-w-[1200px] px-6">
      {children}
    </div>
  );
}
