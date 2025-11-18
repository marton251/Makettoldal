import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [felhasznalo, beallitFelhasznalo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const nev = localStorage.getItem("felhasznalo_nev");
    const email = localStorage.getItem("felhasznalo_email");

    if (token && nev) {
      beallitFelhasznalo({
        felhasznalo_nev: nev,
        email: email || "",
      });
    }
  }, []);

  function bejelentkezve(adat) {
    if (adat) {
      localStorage.setItem("felhasznalo_nev", adat.felhasznalo_nev);
      localStorage.setItem("felhasznalo_email", adat.email || "");
    }
    beallitFelhasznalo(adat);
  }

  function kijelentkezes() {
    localStorage.removeItem("token");
    localStorage.removeItem("felhasznalo_nev");
    localStorage.removeItem("felhasznalo_email");
    // profiladatokat direkt nem töröljük, maradhatnak
    beallitFelhasznalo(null);
  }

  return (
    <AuthContext.Provider value={{ felhasznalo, bejelentkezve, kijelentkezes }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth csak AuthProvider-en belul hasznalhato");
  return ctx;
}
