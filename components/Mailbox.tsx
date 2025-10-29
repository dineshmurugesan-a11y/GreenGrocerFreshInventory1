import React, { useState, useEffect } from 'react';
import type { Notification, Store } from '../types';
import { generateNotifications } from '../services/geminiService';

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
    const baseClass = "w-6 h-6";
    switch(type) {
        case 'Alert':
            return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${baseClass} text-red-500`}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>;
        case 'Info':
            return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${baseClass} text-blue-500`}><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>;
        case 'Reminder':
            return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${baseClass} text-yellow-500`}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
        default:
            return null;
    }
}


const Mailbox: React.FC<{ store: Store }> = ({ store }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!store) return;
            setIsLoading(true);
            const data = await generateNotifications(store.name);
            setNotifications(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setIsLoading(false);
        };
        fetchData();
    }, [store]);

    const toggleReadStatus = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
    }

    if (isLoading) {
        return <div className="text-center py-10"><p>Loading notifications for {store.name}...</p></div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Mailbox for {store.name}</h2>
                <p className="text-gray-500">Notifications, alerts, and reminders.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md">
                <ul className="divide-y divide-gray-200">
                    {notifications.map(notification => (
                        <li key={notification.id} className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-green-50' : ''}`}>
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <NotificationIcon type={notification.type} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-bold text-gray-900 truncate">{notification.title}</p>
                                        <p className="text-xs text-gray-500">{new Date(notification.date).toLocaleString()}</p>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                </div>
                                <div className="flex-shrink-0">
                                    <button onClick={() => toggleReadStatus(notification.id)} className="text-xs text-blue-600 hover:underline">
                                        {notification.read ? 'Mark as Unread' : 'Mark as Read'}
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default Mailbox;