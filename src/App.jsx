import { useState, useRef, useEffect, useMemo } from 'react'

const CATEGORIES = [
  { id: 'deep', label: 'Deep Work', type: 'credit', code: 'DW' },
  { id: 'learning', label: 'Learning', type: 'credit', code: 'LR' },
  { id: 'creative', label: 'Creative', type: 'credit', code: 'CR' },
  { id: 'meetings', label: 'Meetings', type: 'debit', code: 'MT' },
  { id: 'admin', label: 'Admin / Email', type: 'debit', code: 'AD' },
  { id: 'distraction', label: 'Distraction', type: 'debit', code: 'DS' },
]

const catById = (id) => CATEGORIES.find((c) => c.id === id)

function formatHM(totalMinutes) {
  const sign = totalMinutes < 0 ? '-' : ''
  const abs = Math.abs(Math.round(totalMinutes))
  const h = Math.floor(abs / 60)
  const m = abs % 60
  if (h === 0) return `${sign}${m}m`
  return `${sign}${h}h ${m.toString().padStart(2, '0')}m`
}

function formatClock(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map((v) => v.toString().padStart(2, '0')).join(':')
}

function formatEntryNo(i) {
  return String(i + 1).padStart(4, '0')
}

function formatTimestamp(ts) {
  const d = new Date(ts)
  return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' }) +
    ' · ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

let idCounter = 1

export default function App() {
  const [entries, setEntries] = useState([])
  const [selectedCat, setSelectedCat] = useState('deep')
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [manualMinutes, setManualMinutes] = useState('')
  const [justPostedId, setJustPostedId] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const orderedEntries = useMemo(
    () => [...entries].sort((a, b) => a.timestamp - b.timestamp),
    [entries]
  )

  const ledgerRows = useMemo(() => {
    let balance = 0
    return orderedEntries.map((e, i) => {
      const cat = catById(e.categoryId)
      const signedMinutes = cat.type === 'credit' ? e.minutes : -e.minutes
      balance += signedMinutes
      return { ...e, cat, balance, entryNo: formatEntryNo(i) }
    })
  }, [orderedEntries])

  const totals = useMemo(() => {
    const perCategory = {}
    CATEGORIES.forEach((c) => (perCategory[c.id] = 0))
    let credit = 0
    let debit = 0
    entries.forEach((e) => {
      perCategory[e.categoryId] += e.minutes
      if (catById(e.categoryId).type === 'credit') credit += e.minutes
      else debit += e.minutes
    })
    return { perCategory, credit, debit, net: credit - debit }
  }, [entries])

  function postEntry(minutes, categoryId) {
    if (!minutes || minutes <= 0) return
    const id = idCounter++
    setEntries((prev) => [
      ...prev,
      { id, categoryId, minutes, timestamp: Date.now() },
    ])
    setJustPostedId(id)
    setTimeout(() => setJustPostedId(null), 900)
  }

  function handlePostTimer() {
    const minutes = Math.round(seconds / 60)
    if (minutes < 1) return
    postEntry(minutes, selectedCat)
    setSeconds(0)
    setRunning(false)
  }

  function handleManualPost() {
    const minutes = parseInt(manualMinutes, 10)
    postEntry(minutes, selectedCat)
    setManualMinutes('')
  }

  function voidEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const maxCategoryMinutes = Math.max(
    1,
    ...CATEGORIES.map((c) => totals.perCategory[c.id])
  )

  return (
    <div className="ledger-app">
      <header className="masthead">
        <div className="masthead-inner">
          <div className="stamp-mark" aria-hidden="true">
            EST. TODAY
          </div>
          <h1>The Attention Ledger</h1>
          <p className="subtitle">A daily journal of where your hours go</p>
        </div>
      </header>

      <main className="spread">
        {/* LEFT PAGE — Journal / Timer */}
        <section className="page page-left">
          <div className="page-heading">
            <span className="page-label">Journal</span>
            <span className="page-folio">Folio I</span>
          </div>

          <div className="timer-block">
            <div className="timer-clock">{formatClock(seconds)}</div>
            <div className="category-picker">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  className={
                    'cat-chip cat-' +
                    c.type +
                    (selectedCat === c.id ? ' active' : '')
                  }
                  onClick={() => setSelectedCat(c.id)}
                >
                  <span className="chip-code">{c.code}</span>
                  {c.label}
                </button>
              ))}
            </div>
            <div className="timer-controls">
              {!running ? (
                <button className="btn btn-primary" onClick={() => setRunning(true)}>
                  {seconds === 0 ? 'Start session' : 'Resume'}
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={() => setRunning(false)}>
                  Pause
                </button>
              )}
              <button
                className="btn btn-post"
                disabled={seconds < 60}
                onClick={handlePostTimer}
              >
                Post entry
              </button>
              {seconds > 0 && !running && (
                <button className="btn btn-ghost" onClick={() => setSeconds(0)}>
                  Reset
                </button>
              )}
            </div>

            <div className="manual-entry">
              <label htmlFor="manual-minutes">or log time already spent</label>
              <div className="manual-row">
                <input
                  id="manual-minutes"
                  type="number"
                  min="1"
                  placeholder="minutes"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(e.target.value)}
                />
                <button className="btn btn-post" onClick={handleManualPost}>
                  Post
                </button>
              </div>
            </div>
          </div>

          <div className="entries-block">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th className="col-no">No.</th>
                  <th className="col-date">Date</th>
                  <th className="col-desc">Description</th>
                  <th className="col-debit">Debit</th>
                  <th className="col-credit">Credit</th>
                  <th className="col-balance">Balance</th>
                </tr>
              </thead>
              <tbody>
                {ledgerRows.length === 0 && (
                  <tr className="empty-row">
                    <td colSpan={6}>
                      No entries filed yet — post your first session above.
                    </td>
                  </tr>
                )}
                {ledgerRows.map((row) => (
                  <tr
                    key={row.id}
                    className={row.id === justPostedId ? 'row-posted' : ''}
                  >
                    <td className="col-no">{row.entryNo}</td>
                    <td className="col-date">{formatTimestamp(row.timestamp)}</td>
                    <td className="col-desc">
                      {row.cat.label}
                      <button
                        className="void-btn"
                        title="Void this entry"
                        onClick={() => voidEntry(row.id)}
                      >
                        void
                      </button>
                    </td>
                    <td className="col-debit">
                      {row.cat.type === 'debit' ? formatHM(row.minutes) : ''}
                    </td>
                    <td className="col-credit">
                      {row.cat.type === 'credit' ? formatHM(row.minutes) : ''}
                    </td>
                    <td className={'col-balance ' + (row.balance < 0 ? 'neg' : '')}>
                      {formatHM(row.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* RIGHT PAGE — Balance Sheet */}
        <section className="page page-right">
          <div className="page-heading">
            <span className="page-label">Balance Sheet</span>
            <span className="page-folio">Folio II</span>
          </div>

          <div className="net-balance">
            <span className="net-label">Net balance today</span>
            <span className={'net-value ' + (totals.net < 0 ? 'neg' : 'pos')}>
              {totals.net >= 0 ? '+' : ''}
              {formatHM(totals.net)}
            </span>
            <span className="net-sub">
              {formatHM(totals.credit)} banked · {formatHM(totals.debit)} spent
            </span>
          </div>

          <div className="accounts">
            <div className="accounts-heading">Accounts</div>
            {CATEGORIES.map((c) => {
              const minutes = totals.perCategory[c.id]
              const pct = Math.round((minutes / maxCategoryMinutes) * 100)
              return (
                <div className="account-row" key={c.id}>
                  <div className="account-label">
                    <span className="chip-code">{c.code}</span>
                    {c.label}
                  </div>
                  <div className="account-bar-track">
                    <div
                      className={'account-bar account-' + c.type}
                      style={{ width: pct + '%' }}
                    />
                  </div>
                  <div className="account-value">{formatHM(minutes)}</div>
                </div>
              )
            })}
          </div>

          <div className="ledger-footer">
            <p>
              Credits are hours that compound — deep work, learning, making
              things. Debits are hours that get spent and don't come back.
              The ledger doesn't judge; it just keeps the books honest.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
