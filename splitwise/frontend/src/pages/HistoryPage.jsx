import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function formatSplits(splits) {
  if (!splits) return '';
  try {
    const s = JSON.parse(splits);
    const parts = Object.entries(s.values || {}).map(([name, val]) => `${name}: ${val}`);
    return `${s.mode}${s.mode === 'percent' ? ' (by %)' : ''} — ${parts.join(', ')}`;
  } catch {
    return '';
  }
}

const fmtAmount = (n) => {
  const num = Number(n);
  return isNaN(num) ? n : `£${num.toFixed(2)}`;
};

export default function HistoryPage() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const res = await fetch('/api/expenses');
    const data = await res.json();
    // newest first (date desc, then id desc)
    data.sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.id - a.id);
    setItems(data);
  };

  useEffect(() => { load(); }, []);

  const toggleSettled = async (expense) => {
    const updated = { ...expense, settled: !expense.settled };
    const res = await fetch(`/api/expenses/${expense.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (!res.ok) {
      alert('Failed to toggle settled');
      return;
    }
    const saved = await res.json();
    setItems((prev) => prev.map((e) => (e.id === saved.id ? saved : e)));
  };

  const deleteExpense = async (id) => {
    if (!confirm('Delete this expense?')) return;
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    if (res.status === 204) {
      setItems((prev) => prev.filter((e) => e.id !== id));
    } else {
      alert('Failed to delete');
    }
  };

  return (
    <div className="page">
      <h1>Expense History</h1>
      <div className="list">
        {items.map((e) =>
          e.settled ? (
            // Replaced row: show a note card with details (and keep actions)
            <div key={`note-${e.id}`} className="card" style={{ fontStyle: 'italic' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                <div>
                  Settled: “{e.description}” — total {fmtAmount(e.amount)}, paid by {e.paidBy}.
                  {e.splits && <> Split: {formatSplits(e.splits)}</>}
                  {e.date && <> (on {e.date})</>}
                </div>
                <div className="actions">
                  <Link to={`/edit/${e.id}`}><button>Edit</button></Link>
                  <button onClick={() => toggleSettled(e)}>Unsettle</button>
                  <button className="danger" onClick={() => deleteExpense(e.id)}>Delete</button>
                </div>
              </div>
            </div>
          ) : (
            <div key={e.id} className="expense-card card">
              <div className="expense-left">
                <div className="desc">{e.description}</div>
                <div className="meta">
                  <span>Paid by {e.paidBy}</span>
                  <span>• {e.participants}</span>
                  <span>• {e.date}</span>
                  {e.splits && <span>• {formatSplits(e.splits)}</span>}
                </div>
              </div>
              <div className="expense-right">
                <div className="amount">{fmtAmount(e.amount)}</div>
                <div className="actions">
                  <Link to={`/edit/${e.id}`}><button>Edit</button></Link>
                  <button onClick={() => toggleSettled(e)}>Settle</button>
                  <button className="danger" onClick={() => deleteExpense(e.id)}>Delete</button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}