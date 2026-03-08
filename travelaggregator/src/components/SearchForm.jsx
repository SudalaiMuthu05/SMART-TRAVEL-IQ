import { useMemo, useState } from 'react'
import CreatableSelect from 'react-select/creatable'
import DatePicker from 'react-datepicker'
import { CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import 'react-datepicker/dist/react-datepicker.css'


const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '48px',
    borderRadius: '0.8rem',
    borderColor: state.isFocused ? '#0ea5e9' : state.isHovered ? '#94a3b8' : '#e2e8f0',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(14, 165, 233, 0.1)' : 'none',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: '#94a3b8',
      boxShadow: '0 0 0 2px rgba(148, 163, 184, 0.1)'
    }
  }),
  menu: base => ({
    ...base,
    zIndex: 40,
    borderRadius: '0.8rem',
    overflow: 'hidden',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#0ea5e9' : state.isFocused ? '#f1f5f9' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: state.isSelected ? '#0284c7' : '#f8fafc'
    }
  })
}

export default function SearchForm({
  form,
  onChange,
  onSubmit,
  loading,
  cityOptions,
  quickDates,
  onQuickDateSelect,
  onCorridorSelect,
  corridors,
  isValid,
  lastCorridor,
  validationMessage
}) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const selectedDate = form.date ? new Date(form.date) : new Date()

  const sourceValid = useMemo(() => Boolean(form.source), [form.source])
  const destinationValid = useMemo(() => Boolean(form.destination), [form.destination])
  const dateValid = useMemo(() => Boolean(form.date), [form.date])

  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900 md:p-6 ${loading ? 'pointer-events-none opacity-50' : ''
        }`}
    >
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <label className="group">
          <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-slate-700 transition-colors group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-slate-100">
            Source City
            {sourceValid && <CheckCircle2 size={14} className="text-emerald-500 animate-in fade-in duration-300" />}
          </p>
          <div className="transition-all duration-200 hover:shadow-md focus-within:shadow-md focus-within:ring-2 focus-within:ring-sky-500/20 rounded-xl">
            <CreatableSelect
              options={cityOptions}
              value={cityOptions.find(option => option.value === form.source) || (form.source ? { value: form.source, label: form.source } : null)}
              onChange={option => onChange({ target: { name: 'source', value: option?.value || '' } })}
              placeholder="Search or type a city"
              formatCreateLabel={inputValue => `Use "${inputValue}"`}
              noOptionsMessage={({ inputValue }) =>
                inputValue ? `City not found: ${inputValue}. Press enter to use it.` : 'Start typing to search Indian cities'
              }
              isSearchable
              styles={selectStyles}
            />
          </div>
        </label>

        <label className="group">
          <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-slate-700 transition-colors group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-slate-100">
            Destination City
            {destinationValid && <CheckCircle2 size={14} className="text-emerald-500 animate-in fade-in duration-300" />}
          </p>
          <div className="transition-all duration-200 hover:shadow-md focus-within:shadow-md focus-within:ring-2 focus-within:ring-sky-500/20 rounded-xl">
            <CreatableSelect
              options={cityOptions}
              value={
                cityOptions.find(option => option.value === form.destination) ||
                (form.destination ? { value: form.destination, label: form.destination } : null)
              }
              onChange={option => onChange({ target: { name: 'destination', value: option?.value || '' } })}
              placeholder="Search or type a city"
              formatCreateLabel={inputValue => `Use "${inputValue}"`}
              noOptionsMessage={({ inputValue }) =>
                inputValue ? `City not found: ${inputValue}. Press enter to use it.` : 'Start typing to search Indian cities'
              }
              isSearchable
              styles={selectStyles}
            />
          </div>
        </label>

        <label className="group">
          <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-slate-700 transition-colors group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-slate-100">
            Travel Date
            {dateValid && <CheckCircle2 size={14} className="text-emerald-500 animate-in fade-in duration-300" />}
          </p>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 transition-all duration-200 hover:border-slate-300 hover:shadow-md focus-within:border-sky-500 focus-within:shadow-md focus-within:ring-2 focus-within:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-slate-600 dark:focus-within:border-sky-500">
            <DatePicker
              selected={selectedDate}
              onChange={date =>
                onChange({
                  target: { name: 'date', value: format(date || new Date(), 'yyyy-MM-dd') }
                })
              }
              minDate={new Date()}
              dateFormat="dd MMMM yyyy"
              className="w-full bg-transparent text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:placeholder:text-slate-500 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:placeholder:text-slate-400"
              popperPlacement="bottom-start"
              showPopperArrow={false}
            />
          </div>
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Popular Corridors</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {corridors.map(route => {
            const isSelected = lastCorridor === route.label
            return (
              <button
                key={route.label}
                type="button"
                onClick={() => onCorridorSelect(route)}
                className={`rounded-full px-3 py-1 font-medium transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 ${isSelected
                    ? 'bg-sky-500 text-white shadow-md ring-2 ring-sky-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-sky-100 hover:text-sky-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-sky-900/30'
                  }`}
              >
                {route.label}
                {isSelected && <span className="ml-1 text-xs">✓</span>}
              </button>
            )
          })}
        </div>
        {lastCorridor && (
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-in slide-in-from-left duration-300">
            ✓ Applied corridor: <span className="font-semibold">{lastCorridor}</span>
          </p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Quick Dates</p>
        <div className="flex flex-wrap items-center gap-2">
          {quickDates.map(item => (
            <button
              key={item.label}
              type="button"
              onClick={() => onQuickDateSelect(item.value)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 transition-all duration-200 hover:border-skyPulse hover:bg-skyPulse hover:text-white hover:shadow-md hover:scale-105 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-skyPulse dark:hover:border-skyPulse"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition-all duration-200 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600 dark:hover:bg-slate-800/80">
        <button
          type="button"
          onClick={() => setShowAdvanced(prev => !prev)}
          className="flex w-full items-center justify-between text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-200 dark:hover:text-slate-100"
        >
          <span className="flex items-center gap-2">
            Advanced Options
            <span className={`text-xs px-2 py-0.5 rounded-full transition-all duration-200 ${showAdvanced
                ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
                : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
              }`}>
              {showAdvanced ? 'Expanded' : 'Collapsed'}
            </span>
          </span>
          <span className={`text-xs transition-all duration-200 ${showAdvanced ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {showAdvanced && (
          <div className="mt-3 grid gap-3 md:grid-cols-3 animate-in slide-in-from-top duration-300">
            <div className="group">
              <label className="text-xs font-semibold text-slate-500 transition-colors group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">Budget Tier</label>
              <select
                name="budget"
                value={form.budget}
                onChange={onChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-all duration-200 hover:border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600"
              >
                <option>Economy</option>
                <option>Comfort</option>
                <option>Premium</option>
              </select>
            </div>

            <div className="group">
              <label className="text-xs font-semibold text-slate-500 transition-colors group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">Preferred Mode</label>
              <select
                name="mode"
                value={form.mode}
                onChange={onChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-all duration-200 hover:border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600"
              >
                <option>Any</option>
                <option>Flight First</option>
                <option>Train First</option>
                <option>Bus First</option>
              </select>
            </div>

            <div className="group">
              <label className="text-xs font-semibold text-slate-500 transition-colors group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">Travelers</label>
              <select
                name="travelers"
                value={form.travelers}
                onChange={onChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-all duration-200 hover:border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600"
              >
                <option>1-2</option>
                <option>3-4</option>
                <option>5+</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {!isValid && validationMessage && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 animate-in slide-in-from-top duration-300 dark:border-rose-900/50 dark:bg-rose-950/30">
          <p className="text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <span className="text-rose-500">⚠️</span>
            {validationMessage}
          </p>
        </div>
      )}

      <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
        {isValid && (
          <p className="mb-2 text-xs text-slate-600 dark:text-slate-400">
            Analyzing {form.source} to {form.destination} on {format(selectedDate, 'dd MMM yyyy')}.
          </p>
        )}
        <button
          type="submit"
          disabled={!isValid || loading}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 ${!isValid || loading
              ? 'bg-slate-400 cursor-not-allowed opacity-60'
              : 'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 hover:shadow-xl hover:scale-105 active:scale-95'
            }`}
        >
          {loading ? 'Analyzing...' : 'Analyze Journey'}
        </button>
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 transition-all duration-200 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-950/30 dark:border-blue-900/50 dark:hover:bg-blue-950/50">
        <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
          <span className="text-blue-500 mt-0.5">💡</span>
          <span>
            <strong>Pro tip:</strong> City not listed? Type and press enter to use it, or{' '}
            <button
              type="button"
              className="font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors dark:text-blue-400 dark:hover:text-blue-200"
              onClick={() => alert('Support contact feature coming soon!')}
            >
              request it from support
            </button>
          </span>
        </p>
      </div>
    </form>
  )
}
