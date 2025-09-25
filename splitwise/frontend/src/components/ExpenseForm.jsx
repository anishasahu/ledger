import React, { useMemo, useState, useEffect } from 'react';
import { USERS } from '../constant/users';

export default function ExpenseForm({ onSubmit, initial = null }) {
  // basics
  const [description, setDescription] = useState(initial?.description || '');
  const [amount, setAmount] = useState(initial?.amount ?? '');
  const [paidBy, setPaidBy] = useState(initial?.paidBy || USERS[0]);
  const [participants, setParticipants] = useState(
    initial?.participants
      ? initial.participants.split(',').map(s => s.trim())
      : USERS.slice(0, 2)
  );
  const [date, setDate] = useState(initial?.date || new Date().toISOString().slice(0, 10));

  // split mode + allocations
  const parsedInitialSplits = useMemo(() => {
    try {
      return initial?.splits ? JSON.parse(initial.splits) : null;
    } catch {
      return null;
    }
  }, [initial]);

  const [splitMode, setSplitMode] = useState(parsedInitialSplits?.mode || 'equal'); // 'equal' | 'amount' | 'percent'
  const [alloc, setAlloc] = useState(() => {
    const base = {};
    const src = parsedInitialSplits?.values || {};
    (initial?.participants
      ? initial.participants.split(',').map(s => s.trim())
      : USERS.slice(0, 2)
    ).forEach(name => {
      base[name] = src[name] ?? '';
    });
    return base;
  });

  // keep alloc keys in sync with selected participants
  useEffect(() => {
    setAlloc(prev => {
      const next = { ...prev };
      // add missing
      participants.forEach(p => {
        if (!(p in next)) next[p] = '';
      });
      // remove unselected
      Object.keys(next).forEach(k => {
        if (!participants.includes(k)) delete next[k];
      });
      return next;
    });
  }, [participants]);

  const toggleParticipant = (name) => {
    setParticipants(ps => (ps.includes(name) ? ps.filter(p => p !== name) : [...ps, name]));
  };

  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const validateSplits = () => {
    if (participants.length === 0) {
      alert('Select at least one participant');
      return false;
    }
    const total = toNumber(amount);
    if (!total || total <= 0) {
      alert('Enter a valid amount');
      return false;
    }

    if (splitMode === 'equal') return true;

    const values = participants.map(p => toNumber(alloc[p]));
    if (splitMode === 'amount') {
      const sum = values.reduce((a, b) => a + b, 0);
      if (Math.abs(sum - total) > 0.01) {
        alert(`Amounts must add up to ${total.toFixed(2)}. Current: ${sum.toFixed(2)}`);
        return false;
      }
    } else if (splitMode === 'percent') {
      const sum = values.reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 100) > 0.01) {
        alert(`Percentages must add up to 100%. Current: ${sum.toFixed(2)}%`);
        return false;
      }
    }
    return true;
  };

  const buildSplits = () => {
    const total = toNumber(amount);
    if (splitMode === 'equal') {
      const each = participants.length ? Number((total / participants.length).toFixed(2)) : 0;
      const values = Object.fromEntries(participants.map(p => [p, each]));
      return { mode: 'equal', values, total };
    }
    if (splitMode === 'amount') {
      const values = Object.fromEntries(participants.map(p => [p, toNumber(alloc[p])]));
      return { mode: 'amount', values, total };
    }
    // percent
    const values = Object.fromEntries(participants.map(p => [p, Number(((toNumber(alloc[p]) / 100) * total).toFixed(2))]));
    const percents = Object.fromEntries(participants.map(p => [p, toNumber(alloc[p])]));
    return { mode: 'percent', values, percents, total };
  };

  const submit = (e) => {
    e.preventDefault();
    if (!description || !amount) {
      alert('Please supply description and amount');
      return;
    }
    if (!validateSplits()) return;

    const splits = buildSplits();

    onSubmit({
      description,
      amount: Number(parseFloat(amount).toFixed(2)),
      paidBy,
      participants: participants.join(','), // keep names for compatibility
      splits: JSON.stringify(splits),       // store detailed split
      date,
    });
  };

  return (
    <form className="form card" onSubmit={submit}>
      <label>
        Description
        <input value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>

      <label>
        Total Amount
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>

      <label>
        Paid By
        <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
          {USERS.map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </label>

      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend>Participants</legend>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {USERS.map(u => (
            <label key={u} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <input
                type="checkbox"
                checked={participants.includes(u)}
                onChange={() => toggleParticipant(u)}
              />
              {u}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="card" style={{ marginTop: '1rem' }}>
        <legend>Split Method</legend>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '.75rem' }}>
          <label><input type="radio" name="split" value="equal" checked={splitMode === 'equal'} onChange={() => setSplitMode('equal')} /> Equal</label>
          <label><input type="radio" name="split" value="amount" checked={splitMode === 'amount'} onChange={() => setSplitMode('amount')} /> Amount</label>
          <label><input type="radio" name="split" value="percent" checked={splitMode === 'percent'} onChange={() => setSplitMode('percent')} /> Percentage</label>
        </div>

        {splitMode !== 'equal' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {participants.map(p => (
              <label key={p}>
                {p}
                <input
                  type="number"
                  step={splitMode === 'amount' ? '0.01' : '0.1'}
                  min="0"
                  placeholder={splitMode === 'amount' ? 'Amount' : '%'}
                  value={alloc[p] ?? ''}
                  onChange={e => setAlloc(a => ({ ...a, [p]: e.target.value }))}
                />
              </label>
            ))}
          </div>
        ) : (
          <p className="text-muted" style={{ margin: 0 }}>
            Equal split will divide the total across selected participants.
          </p>
        )}
      </fieldset>

      <label>
        Date
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>

      <button type="submit">Save</button>
    </form>
  );
}