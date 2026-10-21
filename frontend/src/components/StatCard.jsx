export default function StatCard({ label, value, bg, iconBg, icon }) {
  return (
    <div className={`flex h-24 w-full flex-col justify-between rounded-md p-3 ${bg}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-800">{label}</div>
      <div className="flex items-end justify-between">
        <div className="text-xl font-medium text-slate-900">{value}</div>
        <div className={`flex h-9 w-9 items-center justify-center rounded text-lg ${iconBg}`}>{icon}</div>
      </div>
    </div>
  );
}