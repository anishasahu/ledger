import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import PersonalPage from './pages/PersonalPage';
import AddExpense from './pages/AddExpense';
import HistoryPage from './pages/HistoryPage';
import EditExpense from './pages/EditExpense';
import SummaryPage from './pages/SummaryPage';
import './App.css';

export default function App() {
  return (
    <div className="app-root">
      <header className="topbar">
        <div className="brand">Ledger</div>
        <nav className="nav-bar">
          <Link to="/add">Add Expense</Link>
          <Link to="/history">Activity</Link>
          <Link to="/personal">Individual Expenses</Link>
          <Link to="/summary">Total Expenses</Link>
        </nav>
      </header>

      <main className="main">
        <Routes>
          {/* redirect root to Add page */}
          <Route path="/" element={<Navigate to="/add" replace />} />
          <Route path="/add" element={<AddExpense />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/edit/:id" element={<EditExpense />} />
          <Route path="/personal" element={<PersonalPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          {/* optional: catch-all */}
          <Route path="*" element={<Navigate to="/add" replace />} />
        </Routes>
      </main>

      <footer className="footer"></footer>
    </div>
  );
}