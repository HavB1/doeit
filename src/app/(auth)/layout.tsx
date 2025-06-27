export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-background mt-32">
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  );
}
