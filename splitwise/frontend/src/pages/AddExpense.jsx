import React from 'react';
import ExpenseForm from '../components/ExpenseForm';
import { useToast } from '../components/ToastProvider';

const fmtGBP = (n) => `£${Number(n || 0).toFixed(2)}`;

function splitSummary(saved) {
  const names = (saved.participants || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (!names.length) return 'no participants specified';

  // Prefer detailed splits if present
  if (saved.splits) {
    try {
      const s = JSON.parse(saved.splits);
      const values = s?.values || {};

      // amount or percent (values are amounts in our form)
      const parts = names.map(n => `${n} ${fmtGBP(values[n] || 0)}`);
      const label = s?.mode === 'percent' ? 'split by % among' : 'split among';
      return `${label} ${names.join(', ')} (${parts.join(', ')})`;
    } catch {
      // fall through to basic equal message
    }
  }

  // Fallback when no splits field exists
  const each = names.length ? Number(saved.amount || 0) / names.length : 0;
  return `split among ${names.join(', ')}💰`;
}

export default function AddExpense() {
  const toast = useToast();

  const submit = async (payload) => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${text}`);
      }

      const saved = await res.json();

      const msg = `${saved.paidBy} added “${saved.description}” for ${fmtGBP(saved.amount)} — ${splitSummary(saved)}.`;
      toast.success(msg);

      // Optional: fire-and-forget notification to backend (ignore errors)
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'expense_created', id: saved.id }),
        });
      } catch (e) {
        console.debug('notify failed', e);
      }

      // Stay on this page (no redirect)
    } catch (e) {
      console.error('Failed to save expense:', e);
      toast.error(`Failed to save: ${e.message || e}`);
    }
  };

  return (
    <div className="page">
      <h1>Add Expense</h1>
      <ExpenseForm onSubmit={submit} />
    </div>
  );
}