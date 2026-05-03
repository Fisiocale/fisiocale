import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabaseClient';
import { StorageService } from '../services/storageService';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getFallbackName(sessionUser: Session['user']): string {
  return (
    sessionUser.user_metadata?.name ||
    sessionUser.email?.split('@')[0] ||
    'Usuário'
  );
}

async function buildAppUserFromSession(session: Session): Promise<User> {
  const authUser = session.user;

  const fallbackUser: User = {
    id: authUser.id,
    name: getFallbackName(authUser),
    email: authUser.email || '',
    createdAt: authUser.created_at,
  };

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, name, email, created_at')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) {
    console.warn('Não foi possível carregar o perfil do usuário:', error.message);

    await supabase.from('profiles').upsert({
      id: authUser.id,
      name: fallbackUser.name,
      email: fallbackUser.email,
    });

    return fallbackUser;
  }

  if (!profile) {
    await supabase.from('profiles').upsert({
      id: authUser.id,
      name: fallbackUser.name,
      email: fallbackUser.email,
    });

    return fallbackUser;
  }

  return {
    id: profile.id,
    name: profile.name || fallbackUser.name,
    email: profile.email || fallbackUser.email,
    createdAt: profile.created_at || fallbackUser.createdAt,
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrateSession = async (session: Session | null) => {
    try {
      if (!session) {
        setUser(null);
        return;
      }

      const appUser = await buildAppUserFromSession(session);
      setUser(appUser);

      try {
        await StorageService.syncFromSupabase(session.user.id);
      } catch (syncError) {
        console.warn('Falha ao sincronizar dados do Supabase:', syncError);
      }
    } catch (error) {
      console.error('Erro ao carregar sessão do usuário:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      setLoading(true);

      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (error) {
        console.error('Erro ao localizar sessão do Supabase:', error.message);
        setUser(null);
        setLoading(false);
        return;
      }

      await hydrateSession(data.session);

      if (isMounted) {
        setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrateSession(session).finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Erro ao sair da conta:', error.message);
    }

    setUser(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-slate-500">
        Localizando sessão do Supabase...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};