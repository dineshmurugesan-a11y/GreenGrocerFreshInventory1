import React from 'react';
import { Role } from '../types';

const NavItem: React.FC<{
  icon: React.ReactElement;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center p-3 rounded-lg text-gray-900 ${
        isActive ? 'bg-green-100 font-bold text-green-grocer-dark' : 'hover:bg-gray-100'
      }`}
    >
      {React.cloneElement(icon, {
        className: `w-6 h-6 transition duration-75 ${
          isActive ? 'text-green-grocer-dark' : 'text-gray-500 group-hover:text-gray-900'
        }`,
      })}
      <span className="ml-3">{label}</span>
    </a>
  </li>
);

const SideNav: React.FC<{
  userRole: Role;
  activeView: string;
  setActiveView: (view: string) => void;
}> = ({ userRole, activeView, setActiveView }) => {
  if (userRole !== Role.StoreManager) {
    return null;
  }

  const navItems = [
    {
      label: 'Orders',
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 12 2.25a2.251 2.251 0 0 1 1.026 4.236 1.5 1.5 0 0 1-.571 2.813H9.25a1.5 1.5 0 0 1-1.474-1.874 2.25 2.25 0 0 1 .304-1.221Z" /></svg>,
    },
    {
      label: 'Spoilage Analysis',
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" /></svg>,
    },
    {
      label: 'Regional View',
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.5-13.5-3.75 3.75-3.75-3.75m11.25 15-3.75-3.75-3.75 3.75M3 13.5h18" /></svg>,
    },
    {
      label: 'Mailbox',
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>,
    },
  ];

  return (
    <aside className="w-64" aria-label="Sidebar">
      <div className="overflow-y-auto py-8 px-3 h-full bg-white border-r border-gray-200">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={activeView === item.label}
              onClick={() => setActiveView(item.label)}
            />
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default SideNav;