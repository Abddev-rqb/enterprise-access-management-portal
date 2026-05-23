function ErrorState({ message }) {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">
      {message || 'Something went wrong while loading data.'}
    </div>
  )
}

export default ErrorState
