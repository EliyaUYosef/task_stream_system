import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [phone, setPhone] = useState("972525676077"); // זמנית, בהמשך דינמי

  return (
    <UserContext.Provider value={{ phone, setPhone }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
