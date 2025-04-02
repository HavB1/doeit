export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div className="flex h-full w-full flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
