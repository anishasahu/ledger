import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ExpenseForm from '../components/ExpenseForm';

export default function EditExpense() {
  const { id } = useParams();
  const nav = useNavigate();
  const [expense, setExpense] = useState(null);

  useEffect(() => {
    fetch(`/api/expenses/${id}`)
      .then(r => r.json())
      .then(setExpense);
  }, [id]);

  const save = async (payload) => {
    payload.id = id; // ensure id
    payload.settled = expense.settled; // preserve settled status
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      nav('/history');
    } else {
      alert('Failed to update expense');
    }
  };

  if (!expense) return <div>Loading…</div>;

  return (
    <div className="page">
      <h1>Edit Expense</h1>
      <ExpenseForm onSubmit={save} initial={expense} />
    </div>
  );
}
