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

    //implementerar här "session storage" för fejk-login.
    // (visste inte att man kunde lägga functions i useState tidigare)
    const [currentUser, setCurrentUser] = useState(() =>{
        const savedUserType = sessionStorage.getItem("userType");

        if (!savedUserType){
            return null;
        };

        return testUsers[savedUserType] ?? null;
    });

    function selectUser(userType){

        if (userType === "visitor") {
            sessionStorage.removeItem("userType");
            setCurrentUser(null);

            return;
        };

        const selectedUser = testUsers[userType];

        if(!selectedUser){
            return;
        };

        sessionStorage.setItem(
            "userType", userType
        );

        setCurrentUser(selectedUser);
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