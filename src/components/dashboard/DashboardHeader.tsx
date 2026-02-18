import bfpLogo from "@/assets/bfp-logo.png";

const DashboardHeader = () => {
  return (
    <header className="h-14 bg-gradient-to-r from-[hsl(var(--fire-orange))] to-[hsl(var(--fire-red))] flex items-center px-4 gap-3 flex-shrink-0 shadow-md">
      <img src={bfpLogo} alt="BFP Logo" className="w-10 h-10" />
      <div className="flex flex-col">
        <span className="font-bold text-sm text-white leading-tight">
          Emergency Response Navigator
        </span>
        <span className="text-xs text-white/80 leading-tight">
          Bureau of Fire Protection — BULAN
        </span>
      </div>
    </header>
  );
};

export default DashboardHeader;
