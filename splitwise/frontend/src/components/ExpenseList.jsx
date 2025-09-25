import React from 'react';

export default function ExpenseList({ expenses = [], onDelete }) {
  if (!expenses.length) {
    return <div className="card">No expenses yet. Add one.</div>;
  }

  return (
    <div className="list">
      {expenses.map(e => (
        <div key={e.id} className="expense-card card">
          <div className="expense-left">
            <div className="desc">{e.description}</div>
            <div className="meta">
              <span>{e.paidBy}</span>
              <span>•</span>
              <span>{e.participants || '-'}</span>
              <span>•</span>
              <span>{e.date}</span>
            </div>
          </div>
          <div className="expense-right">
            <div className="amount">£{Number(e.amount).toFixed(2)}</div>
            <div className="actions">
              <button onClick={() => alert(JSON.stringify(e, null, 2))}>View</button>
              <button className="danger" onClick={() => onDelete(e.id)}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
