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

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch('/api/expenses');
      const data = await res.json();
      // newest first
      data.sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.id - a.id);
      setExpenses(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  const rows = useMemo(() => {
    return expenses
      .filter(e => parseParticipants(e.participants).includes(person))
      .map(e => {
        const shares = computeShares(e);
        return {
          id: e.id,
          description: e.description,
          date: e.date,
          paidBy: e.paidBy,
          share: Number(shares[person] || 0),
          amount: Number(e.amount || 0),
          splits: e.splits,
        };
      });
  }, [expenses, person]);

  const totalForPerson = useMemo(
    () => rows.reduce((sum, r) => sum + Number(r.share || 0), 0),
    [rows]
  );

  return (
    <div className="page">
      <h1>Personal Expenses</h1>

      <div className="card">
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '.75rem' }}>
          Person
          <select
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            style={{ marginTop: '.45rem' }}
          >
            {USERS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </label>

        {loading ? (
          <p className="text-muted">Loading…</p>
        ) : (
          <>
            <p className="font-bold" style={{ margin: '0 0 1rem' }}>
              Total expenses for {person}: {fmt(totalForPerson)}
            </p>

            {rows.length === 0 ? (
              <p className="text-muted">No expenses for {person} yet.</p>
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