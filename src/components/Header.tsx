import { HeaderNav } from "./HeaderNav";
import { UserHeaderSection } from "./UserHeaderSection";

export default function Header() {
  return (
    <div className="bg-gray-800 text-white px-6 py-3 flex justify-between fixed w-full top-0 z-50">
      <div className="flex items-center gap-3">
        <img
          src="/ramon_logo.svg"
          alt="Ramón Logo"
          className="h-8 w-8 bg-amber-50 border-2 border-b-cyan-900 rounded-full"
        />
        <h1 className="text-2xl font-bold">Ramón Store</h1>
      </div>

      <HeaderNav />

      <div className=" text-sm text-gray-400">
        <UserHeaderSection />
      </div>
    </div>
  );
}
