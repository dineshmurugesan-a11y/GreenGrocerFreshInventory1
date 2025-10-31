import React, { useState } from 'react';
import type { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === email);
    // In a real app, password would be hashed and checked. Here we just check if user exists.
    if (user) {
      setError('');
      onLogin(user);
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };
  
  // Prefill for easy testing
  const prefillUser = (email: string) => {
    setEmail(email);
    setPassword('password123');
  }

  return (
    <div className="min-h-screen bg-green-grocer-light flex flex-col justify-center items-center p-4">
      <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('https://picsum.photos/seed/grocery/1920/1080')", filter: 'blur(4px)'}}></div>
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
        <div className="p-8">
          <div className="flex justify-center mb-6">
             <div className="bg-green-grocer-900 p-3 rounded-full">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
             </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-green-grocer-900">GreenGrocer</h2>
          <p className="text-center text-gray-500 mt-2 mb-8">Fresh Inventory Optimization</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-grocer focus:border-green-grocer sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-grocer focus:border-green-grocer sm:text-sm"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-grocer hover:bg-green-grocer-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-grocer-dark transition duration-150"
            >
              Sign In
            </button>
          </form>
           <div className="mt-4 text-xs text-center text-gray-500">
                <p>Use mock users for login:</p>
                <div className="flex justify-center space-x-2 mt-2">
                    <button onClick={() => prefillUser(users[0].email)} className="underline hover:text-green-grocer-dark">Store Mgr</button>
                    <button onClick={() => prefillUser(users[1].email)} className="underline hover:text-green-grocer-dark">Regional Mgr</button>
                    <button onClick={() => prefillUser(users[2].email)} className="underline hover:text-green-grocer-dark">Analyst</button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
