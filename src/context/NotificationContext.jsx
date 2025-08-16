import { createContext, useState, useContext } from "react";

const NotificationContext=createContext();

export function NoticationProvider({children}) {
    const [notifications, setNotifications]=useState([]);

    const addNotification=(message) =>{
        setNotifications(prev=>[...prev, {
            id: Date.now(),
            message,
            read: false
        }]);
    };

    return (
        <NotificationContext.Provider value={{notifications, addNotification}}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationContext);
}