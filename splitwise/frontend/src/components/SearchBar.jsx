import React, { useState } from 'react';

export default function SearchBar({ defaultValue = '', onSearch }) {
  const [q, setQ] = useState(defaultValue);

  const submit = (e) => {
    e?.preventDefault();
    onSearch(q);
  };

  return (
    <form className="searchbar" onSubmit={submit}>
      <input
        placeholder="Search description..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button type="submit">Search</button>
      <button type="button" className="muted" onClick={() => { setQ(''); onSearch(''); }}>
        Reset
      </button>
    </form>
  );
}
