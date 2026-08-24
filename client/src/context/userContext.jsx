import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

const testUsers = {visitor: null,

    //"simulerade" users/userStates
    customer: {
        id: 1,
        name: "Test Customer",
        role: "customer"
    },
    admin: {
        id: 2,
        name: "Test Admin",
        role: "admin"
    }
};

function UserProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);

    function selectUser(userType){
        
        setCurrentUser(testUsers[userType]);
    };

    const value = {currentUser,selectUser};

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

function useUser() {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error("useUser must be used inside UserProvider");
    };

    return context;
};

export {UserProvider, useUser};