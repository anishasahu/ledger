// import React, { useEffect, useState } from 'react';
// import { USERS } from '../constant/users';

// export default function SummaryPage() {
//   const [summary, setSummary] = useState({ total: 0, count: 0, perPerson: {} });

//   useEffect(() => {
//     fetch('/api/expenses')
//       .then(r => r.json())
//       .then(data => {
//         let total = 0;
//         const perPerson = {};
//         data.forEach(e => {
//           total += Number(e.amount);
//           const parts = (e.participants || '').split(',').map(s => s.trim()).filter(Boolean);
//           const share = parts.length ? Number(e.amount) / parts.length : 0;
//           parts.forEach(p => {
//             perPerson[p] = (perPerson[p] || 0) + share;
//           });
//         });
//         setSummary({ total, count: data.length, perPerson });
//       });
//   }, []);

//   return (
//     <div className="page">
//       <h1>Total Expenses</h1>
//       <div className="card summary-card">
//         <div><strong>Total:</strong> £{summary.total.toFixed(2)}</div>
//         <div><strong>Number of expenses:</strong> {summary.count}</div>
//       </div>

//       <div className="card">
//         <h3>Per person</h3>
//         {Object.keys(summary.perPerson).length === 0 ? (
//           <p>No participant data yet.</p>
//         ) : (
//           <ul className="person-list">
//             {USERS.map(name => (
//               <li key={name}>
//                 <strong>{name}</strong>: £{Number(summary.perPerson[name] || 0).toFixed(2)}
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from 'react';
import { USERS } from '../constant/users';

const CURRENCY = '£';

const fmt = (n) => `${CURRENCY}${Number(n || 0).toFixed(2)}`;

function parseParticipants(str) {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

function computeShares(expense) {
  const total = Number(expense.amount || 0);
  const people = parseParticipants(expense.participants);
  if (!people.length || total <= 0) return {};

  // Prefer detailed splits if present
  if (expense.splits) {
    try {
      const s = JSON.parse(expense.splits);
      if (s && s.values && typeof s.values === 'object') {
        // values already in amounts for all modes in our form
        const out = {};
        people.forEach(p => { out[p] = Number(s.values[p] || 0); });
        return out;
      }
    } catch {
      // fall through to equal split
    }
  }

  // Fallback: equal split
  const each = Number((total / people.length).toFixed(2));
  return Object.fromEntries(people.map(p => [p, each]));
}

export default function SummaryPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/expenses');
    const data = await res.json();
    setExpenses(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Overall totals (all expenses)
  const overall = useMemo(() => {
    const spentBy = {};
    USERS.forEach(u => (spentBy[u] = 0));

    let total = 0;
    expenses.forEach(e => {
      total += Number(e.amount || 0);
      const shares = computeShares(e); // per-person amounts
      Object.entries(shares).forEach(([name, share]) => {
        spentBy[name] = Number((spentBy[name] || 0) + Number(share || 0));
      });
    });

    return { total, spentBy };
  }, [expenses]);

  // Per-person settlements (only unsettled)
  const perPerson = useMemo(() => {
    const balance = {};
    USERS.forEach(u => (balance[u] = 0));

    expenses
      .filter(e => !e.settled)
      .forEach(e => {
        const amount = Number(e.amount || 0);
        const shares = computeShares(e);
        // payer gets credit for paying the total
        if (e.paidBy) balance[e.paidBy] = Number((balance[e.paidBy] || 0) + amount);
        // each participant owes their share
        Object.entries(shares).forEach(([name, share]) => {
          balance[name] = Number((balance[name] || 0) - Number(share || 0));
        });
      });

    // Build a simple list with message
    const rows = USERS.map(name => {
      const v = Number(balance[name] || 0);
      if (Math.abs(v) < 0.01) return { name, status: 'settled', value: 0, note: `${name} is settled.` };
      if (v > 0) return { name, status: 'receive', value: v, note: `${name} should receive ${fmt(v)}.` };
      return { name, status: 'pay', value: -v, note: `${name} should pay ${fmt(-v)}.` };
    });

    return rows;
  }, [expenses]);

  return (
    <div className="page">
      <h1>Total Expenses</h1>

      <div className="summary-grid">{/* wrap the two cards side by side */}
        <div className="card">
          <h2 style={{ marginBottom: '.75rem' }}>Overall Expenses (Per Person)</h2>
          {loading ? (
            <p className="text-muted">Loading…</p>
          ) : (
            <>
              <ul className="person-list">
                {USERS.map(u => (
                  <li key={u}>
                    <span>{u}</span>
                    <strong>{fmt(overall.spentBy[u] || 0)}</strong>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '.75rem' }}>Expenses To Be Settled (Per Person)</h2>
          {loading ? (
            <p className="text-muted">Loading…</p>
          ) : (
            <ul className="person-list">
              {perPerson.map(row => (
                <li key={row.name}>
                  <span>{row.name}</span>
                  <strong style={{
                    color: row.status === 'pay' ? 'var(--danger)' :
                           row.status === 'receive' ? 'var(--primary)' : 'var(--text-muted)'
                  }}>
                    {row.status === 'settled' ? 'Settled' :
                     row.status === 'pay' ? `Pay ${fmt(row.value)}` :
                     `Receive ${fmt(row.value)}`}
                  </strong>
                </li>
              ))}
            </ul>
          )}
          <p className="text-muted" style={{ marginTop: '.5rem' }}></p>
        </div>
      </div>
    </div>
  );
}