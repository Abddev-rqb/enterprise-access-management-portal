function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-7">
      <h1 className="text-3xl font-bold text-slate-950">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </div>
  )
}

export default PageHeader
