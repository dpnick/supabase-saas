import axios from 'axios';
import { useRouter } from 'next/router';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const Context = createContext();

const Provider = ({ children }) => {
  const [user, setUser] = useState(supabase.auth.user());
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUserProfile = async () => {
      const sessionUser = supabase.auth.user();

      if (sessionUser) {
        const { data: profile } = await supabase
          .from('profile')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        setUser({
          ...sessionUser,
          ...profile,
        });

        setIsLoading(false);
      }
    };

    getUserProfile();
    supabase.auth.onAuthStateChange(() => {
      getUserProfile();
    });
  }, []);

  useEffect(() => {
    axios.post('/api/set-supabase-cookie', {
      event: user ? 'SIGNED_IN' : 'SIGNED_OUT',
      session: supabase.auth.session(),
    });
  }, [user]);

  useEffect(() => {
    if (user) {
      const sub = supabase
        .from(`profile:id=eq.${user.id}`)
        .on('UPDATE', (payload) => {
          setUser((user) => ({ ...user, ...payload.new }));
        })
        .subscribe();

      return () => {
        supabase.removeSubscription(sub);
      };
    }
  }, [user]);

  const login = async () => {
    supabase.auth.signIn({
      provider: 'github',
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useUser = () => useContext(Context);

export default Provider;