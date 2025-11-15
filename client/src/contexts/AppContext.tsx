import { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  plaidAccessToken: string | null;
  setPlaidAccessToken: (token: string | null) => void;
  plaidItemId: string | null;
  setPlaidItemId: (id: string | null) => void;
  increaseEntityId: string | null;
  setIncreaseEntityId: (id: string | null) => void;
  increaseMainAccountId: string | null;
  setIncreaseMainAccountId: (id: string | null) => void;
  userId: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [plaidAccessToken, setPlaidAccessToken] = useState<string | null>(
    localStorage.getItem('plaid_access_token')
  );
  const [plaidItemId, setPlaidItemId] = useState<string | null>(
    localStorage.getItem('plaid_item_id')
  );
  const [increaseEntityId, setIncreaseEntityId] = useState<string | null>(
    localStorage.getItem('increase_entity_id')
  );
  const [increaseMainAccountId, setIncreaseMainAccountId] = useState<string | null>(
    localStorage.getItem('increase_main_account_id')
  );
  const [userId] = useState(() => {
    const stored = localStorage.getItem('user_id');
    if (stored) return stored;
    const newId = `user_${Date.now()}`;
    localStorage.setItem('user_id', newId);
    return newId;
  });

  const handleSetPlaidAccessToken = (token: string | null) => {
    setPlaidAccessToken(token);
    if (token) {
      localStorage.setItem('plaid_access_token', token);
    } else {
      localStorage.removeItem('plaid_access_token');
    }
  };

  const handleSetPlaidItemId = (id: string | null) => {
    setPlaidItemId(id);
    if (id) {
      localStorage.setItem('plaid_item_id', id);
    } else {
      localStorage.removeItem('plaid_item_id');
    }
  };

  const handleSetIncreaseEntityId = (id: string | null) => {
    setIncreaseEntityId(id);
    if (id) {
      localStorage.setItem('increase_entity_id', id);
    } else {
      localStorage.removeItem('increase_entity_id');
    }
  };

  const handleSetIncreaseMainAccountId = (id: string | null) => {
    setIncreaseMainAccountId(id);
    if (id) {
      localStorage.setItem('increase_main_account_id', id);
    } else {
      localStorage.removeItem('increase_main_account_id');
    }
  };

  return (
    <AppContext.Provider
      value={{
        plaidAccessToken,
        setPlaidAccessToken: handleSetPlaidAccessToken,
        plaidItemId,
        setPlaidItemId: handleSetPlaidItemId,
        increaseEntityId,
        setIncreaseEntityId: handleSetIncreaseEntityId,
        increaseMainAccountId,
        setIncreaseMainAccountId: handleSetIncreaseMainAccountId,
        userId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
