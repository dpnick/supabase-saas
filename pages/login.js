import { useEffect } from 'react';
import { useUser } from '../context/user';

export default function Login() {
  const { login } = useUser();

  useEffect(login, []);

  return <p>Logging in</p>;
}
