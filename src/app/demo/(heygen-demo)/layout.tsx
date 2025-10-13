import "@/styles/demo/globals.css";
import { Metadata } from "next";
import EndOverlay from "./overlay/EndOverlay";

export const metadata: Metadata = {
  title: {
    default: "HeyGen Interactive Avatar SDK Demo",
    template: `%s - HeyGen Interactive Avatar SDK Demo`,
  },
  icons: {
    icon: "/demo/heygen-logo.png",
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="relative flex flex-col gap-6 h-screen w-screen">
        {children}
      </main>
      <EndOverlay />
    </div>
  );
}
