function StatCard({ label, value, helper }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-bold text-slate-950">{value}</p>
      {helper && <p className="mt-2 text-xs text-slate-400">{helper}</p>}
    </div>
  )
}

export default StatCard
