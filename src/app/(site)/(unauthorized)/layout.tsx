import { Header } from "~/components/layout";
import "~/styles/globals.css";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center p-4">
        {children}
      </main>
    </>
  );
}
