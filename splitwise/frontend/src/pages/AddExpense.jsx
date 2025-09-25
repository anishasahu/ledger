import React from 'react';
import ExpenseForm from '../components/ExpenseForm';
import { useNavigate } from 'react-router-dom';

export default function AddExpense() {
  const nav = useNavigate();

  const submit = async (payload) => {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const saved = await res.json();
      // navigate back to home to show it
      nav('/');
    } else {
      alert('Failed to save expense');
    }
  };

  return (
    <div className="page">
      <h1>Add Expense</h1>
      <ExpenseForm onSubmit={submit} />
    </div>
  );
}
