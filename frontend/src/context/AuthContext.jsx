import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:5000/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch(() => {
          setUser(null);
          setToken("");
          localStorage.removeItem("token");
        });
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { username, password });
      setToken(res.data.token);
      localStorage.setItem("token", res.data.token);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
