import { useEffect } from 'react';
import { useUser } from '../context/user';

export default function Login() {
  const { logout } = useUser();

  useEffect(logout, []);

  return <p>Logging out</p>;
}
