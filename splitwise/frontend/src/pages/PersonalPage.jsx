// import React, { useEffect, useMemo, useState } from 'react';
// import { USERS } from '../constant/users';

// const CURRENCY = '£';
// const fmt = (n) => `${CURRENCY}${Number(n || 0).toFixed(2)}`;

// function parseParticipants(str) {
//   if (!str) return [];
//   return str.split(',').map(s => s.trim()).filter(Boolean);
// }

// function computeShares(expense) {
//   const total = Number(expense.amount || 0);
//   const people = parseParticipants(expense.participants);
//   if (!people.length || total <= 0) return {};
//   // Prefer detailed splits (values are amounts)
//   if (expense.splits) {
//     try {
//       const s = JSON.parse(expense.splits);
//       if (s && s.values && typeof s.values === 'object') {
//         const out = {};
//         people.forEach(p => { out[p] = Number(s.values[p] || 0); });
//         return out;
//       }
//     } catch {}
//   }
//   // Fallback: equal split
//   const each = Number((total / people.length).toFixed(2));
//   return Object.fromEntries(people.map(p => [p, each]));
// }

// export default function PersonalPage() {
//   const [expenses, setExpenses] = useState([]);
//   const [person, setPerson] = useState(USERS[0]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       const res = await fetch('/api/expenses');
//       const data = await res.json();
//       // newest first
//       data.sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.id - a.id);
//       setExpenses(Array.isArray(data) ? data : []);
//       setLoading(false);
//     })();
//   }, []);

//   const rows = useMemo(() => {
//     return expenses
//       .filter(e => parseParticipants(e.participants).includes(person))
//       .map(e => {
//         const shares = computeShares(e);
//         return {
//           id: e.id,
//           description: e.description,
//           date: e.date,
//           paidBy: e.paidBy,
//           share: Number(shares[person] || 0),
//           amount: Number(e.amount || 0),
//           splits: e.splits,
//         };
//       });
//   }, [expenses, person]);

//   const totalForPerson = useMemo(
//     () => rows.reduce((sum, r) => sum + Number(r.share || 0), 0),
//     [rows]
//   );

//   return (
//     <div className="page">
//       <h1>Personal Expenses</h1>

//       <div className="card">
//         <label style={{ display: 'block', fontWeight: 600, marginBottom: '.75rem' }}>
//           Person
//           <select
//             value={person}
//             onChange={(e) => setPerson(e.target.value)}
//             style={{ marginTop: '.45rem' }}
//           >
//             {USERS.map(u => <option key={u} value={u}>{u}</option>)}
//           </select>
//         </label>

//         {loading ? (
//           <p className="text-muted">Loading…</p>
//         ) : (
//           <>
//             <p className="font-bold" style={{ margin: '0 0 1rem' }}>
//               Total expenses for {person}: {fmt(totalForPerson)}
//             </p>

//             {rows.length === 0 ? (
//               <p className="text-muted">No expenses for {person} yet.</p>
//             ) : (
//               <div className="list">
//                 {rows.map(r => (
//                   <div key={r.id} className="expense-card card">
//                     <div className="expense-left">
//                       <div className="desc">{r.description}</div>
//                       <div className="meta">
//                         <span>Paid by {r.paidBy}</span>
//                         {r.date && <span>• {r.date}</span>}
//                       </div>
//                     </div>
//                     <div className="expense-right">
//                       <div className="amount">{fmt(r.share)}</div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useMemo, useState } from 'react';
import { USERS } from '../constant/users';

const CURRENCY = '£';
const fmt = (n) => `${CURRENCY}${Number(n || 0).toFixed(2)}`;

const MONTHS = [
  { value: 'all', label: 'All months' },
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

function parseParticipants(str) {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

function yOf(dateStr) {
  if (!dateStr) return null;
  return Number(dateStr.slice(0, 4));
}
function mOf(dateStr) {
  if (!dateStr) return null;
  return Number(dateStr.slice(5, 7));
}

function computeShares(expense) {
  const total = Number(expense.amount || 0);
  const people = parseParticipants(expense.participants);
  if (!people.length || total <= 0) return {};
  // Prefer detailed splits (values are amounts)
  if (expense.splits) {
    try {
      const s = JSON.parse(expense.splits);
      if (s && s.values && typeof s.values === 'object') {
        const out = {};
        people.forEach(p => { out[p] = Number(s.values[p] || 0); });
        return out;
      }
    } catch {}
  }
  // Fallback: equal split
  const each = Number((total / people.length).toFixed(2));
  return Object.fromEntries(people.map(p => [p, each]));
}

export default function PersonalPage() {
  const [expenses, setExpenses] = useState([]);
  const [person, setPerson] = useState(USERS[0]);
  const [loading, setLoading] = useState(true);

  // filters
  const [month, setMonth] = useState('all'); // 'all' | 1..12
  const [year, setYear] = useState('all');   // 'all' | YYYY

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch('/api/expenses');
      const data = await res.json();
      data.sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.id - a.id);
      setExpenses(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  const availableYears = useMemo(() => {
    const set = new Set();
    expenses.forEach(e => {
      const y = yOf(e.date);
      if (y) set.add(y);
    });
    return ['all', ...Array.from(set).sort((a, b) => b - a)];
  }, [expenses]);

  const rows = useMemo(() => {
    return expenses
      .filter(e => parseParticipants(e.participants).includes(person))
      .filter(e => {
        const y = yOf(e.date);
        const m = mOf(e.date);
        const passYear = year === 'all' ? true : y === Number(year);
        const passMonth = month === 'all' ? true : m === Number(month);
        return passYear && passMonth;
      })
      .map(e => {
        const shares = computeShares(e);
        return {
          id: e.id,
          description: e.description,
          date: e.date,
          paidBy: e.paidBy,
          share: Number(shares[person] || 0),
          amount: Number(e.amount || 0),
        };
      });
  }, [expenses, person, month, year]);

  const totalForPerson = useMemo(
    () => rows.reduce((sum, r) => sum + Number(r.share || 0), 0),
    [rows]
  );

  return (
    <div className="page">
      <h1>Personal Expenses</h1>

      <div className="card">
        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          <label>
            Person
            <select value={person} onChange={(e) => setPerson(e.target.value)} style={{ marginTop: '.45rem' }}>
              {USERS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </label>

          <label>
            Month
            <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ marginTop: '.45rem' }}>
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </label>

          <label>
            Year
            <select value={year} onChange={(e) => setYear(e.target.value)} style={{ marginTop: '.45rem' }}>
              {availableYears.map(y => (
                <option key={y} value={y}>{y === 'all' ? 'All years' : y}</option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p className="text-muted">Loading…</p>
        ) : (
          <>
            <p className="font-bold" style={{ margin: '0 0 1rem' }}>
              Total for {person}{year !== 'all' && `, ${year}`}{month !== 'all' && `, ${MONTHS.find(m => m.value === Number(month))?.label}`}: {fmt(totalForPerson)}
            </p>

            {rows.length === 0 ? (
              <p className="text-muted">No expenses for the selected filters.</p>
            ) : (
              <div className="list">
                {rows.map(r => (
                  <div key={r.id} className="expense-card card">
                    <div className="expense-left">
                      <div className="desc">{r.description}</div>
                      <div className="meta">
                        <span>Paid by {r.paidBy}</span>
                        {r.date && <span>• {r.date}</span>}
                      </div>
                    </div>
                    <div className="expense-right">
                      <div className="amount">{fmt(r.share)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}