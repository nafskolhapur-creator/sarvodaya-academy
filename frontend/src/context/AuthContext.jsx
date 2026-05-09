import { createContext, useContext, useEffect, useState } from "react";

import {
  adminLoginRequest,
  getAdminSessionRequest,
  getStudentSessionRequest,
  loginRequest,
} from "../services/api";

const AuthContext = createContext(null);
const portalStorageKey = "sarvodaya-auth";
const adminStorageKey = "sarvodaya-admin-session";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [portalSession, setPortalSession] = useState(null);
  const [adminSession, setAdminSession] = useState(null);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [isAdminBootstrapping, setIsAdminBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrapSessions = async () => {
      const storedPortalUser = window.localStorage.getItem(portalStorageKey);
      const storedAdminSession = window.localStorage.getItem(adminStorageKey);

      if (storedPortalUser) {
        try {
          const parsedPortalSession = JSON.parse(storedPortalUser);
          setPortalSession(parsedPortalSession);
          setUser(parsedPortalSession.user || null);

          if (parsedPortalSession.token) {
            const response = await getStudentSessionRequest(parsedPortalSession.token);
            persistUser({
              user: response.user,
              token: parsedPortalSession.token,
            });
          }
        } catch {
          setPortalSession(null);
          setUser(null);
          window.localStorage.removeItem(portalStorageKey);
        } finally {
          setIsBootstrapping(false);
        }
      } else {
        setIsBootstrapping(false);
      }

      if (storedAdminSession) {
        try {
          const parsedSession = JSON.parse(storedAdminSession);
          setAdminSession(parsedSession);
          const response = await getAdminSessionRequest(parsedSession.token);
          persistAdminSession({
            admin: response.admin,
            token: parsedSession.token,
          });
        } catch {
          setAdminSession(null);
          window.localStorage.removeItem(adminStorageKey);
        } finally {
          setIsAdminBootstrapping(false);
        }
      } else {
        setIsAdminBootstrapping(false);
      }
    };

    bootstrapSessions();
  }, []);

  const persistUser = (nextSession) => {
    setPortalSession(nextSession);
    setUser(nextSession?.user || null);
    window.localStorage.setItem(portalStorageKey, JSON.stringify(nextSession));
  };

  const persistAdminSession = (nextSession) => {
    setAdminSession(nextSession);
    window.localStorage.setItem(adminStorageKey, JSON.stringify(nextSession));
  };

  const login = async (credentials) => {
    setIsLoading(true);

    try {
      const response = await loginRequest(credentials);
      const session = {
        user: response.user,
        token: response.token,
      };
      persistUser(session);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const continueAsGuest = () => {
    persistUser({
      user: {
        id: "external-user-preview",
        name: "Guest Explorer",
        email: "guest@sarvodayaacademy.edu",
        role: "external-user",
      },
      token: "",
    });
  };

  const logout = () => {
    setPortalSession(null);
    setUser(null);
    window.localStorage.removeItem(portalStorageKey);
  };

  const adminLogin = async (credentials) => {
    setIsAdminLoading(true);

    try {
      const response = await adminLoginRequest(credentials);
      const session = {
        admin: response.admin,
        token: response.token,
      };

      persistAdminSession(session);
      return session;
    } finally {
      setIsAdminLoading(false);
    }
  };

  const logoutAdmin = () => {
    setAdminSession(null);
    window.localStorage.removeItem(adminStorageKey);
  };

  const value = {
    user,
    isLoading,
    isBootstrapping,
    login,
    logout,
    continueAsGuest,
    userToken: portalSession?.token || "",
    admin: adminSession?.admin || null,
    adminToken: adminSession?.token || "",
    isAdminLoading,
    isAdminBootstrapping,
    adminLogin,
    logoutAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
