import React, { createContext, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(1);

  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const push = (type, message) => {
    const id = idRef.current++;
    setToasts((t) => [...t, { id, type, message }]);
    // auto-dismiss
    setTimeout(() => remove(id), 3500);
  };

  const api = useMemo(() => ({
    success: (msg) => push('success', msg),
    error:   (msg) => push('error', msg),
    info:    (msg) => push('info', msg),
  }), []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.type}`} role="status">
            <div className="toast__bar" />
            <div className="toast__body">{t.message}</div>
            <button className="toast__close" onClick={() => remove(t.id)} aria-label="Close">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);