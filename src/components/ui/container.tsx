interface ContainerProps {
  children: React.ReactNode;
}

export function Container({ children }: ContainerProps) {
  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
      {children}
    </div>
  );
}
