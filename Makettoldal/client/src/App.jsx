import React from "react";
import { NavLink, Route, Routes, Link } from "react-router-dom";
import Kezdolap from "./pages/Kezdolap";
import Makettek from "./pages/Makettek";
import Bejelentkezes from "./pages/Bejelentkezes";
import Regisztracio from "./pages/Regisztracio";
import Profil from "./pages/Profil";
import { useAuth } from "./context/AuthContext";

function generalSzin(nev) {
  if (!nev) return "#4b5563";
  let hash = 0;
  for (let i = 0; i < nev.length; i++) {
    hash = nev.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 45%)`;
}

function Avatar({ nev, meret = 28 }) {
  if (!nev) nev = "P";

  const fileKulcs = "profil_kep_file_" + nev;
  const urlKulcs = "profil_kep_url_" + nev;

  const fileAdat = typeof window !== "undefined" ? localStorage.getItem(fileKulcs) : null;
  const urlAdat = typeof window !== "undefined" ? localStorage.getItem(urlKulcs) : null;

  const stilus = {
    width: meret,
    height: meret,
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: meret / 2,
    background: generalSzin(nev),
    color: "#f9fafb",
    overflow: "hidden",
  };

  if (fileAdat) {
    return <img src={fileAdat} alt="profil" style={{ ...stilus, objectFit: "cover" }} />;
  }

  if (urlAdat) {
    return <img src={urlAdat} alt="profil" style={{ ...stilus, objectFit: "cover" }} />;
  }

  const kezdobetu = nev.trim().charAt(0).toUpperCase();
  return <div style={stilus}>{kezdobetu}</div>;
}

function Elrendezes({ gyerekek }) {
  const ev = new Date().getFullYear();
  const { felhasznalo } = useAuth();

  return (
    <div className="app">
      <header className="header">
        <div className="wrap header-inner">
          <div className="brand">
            <div className="logo"></div>
            <h1>Makett Velemenyezo</h1>
          </div>
          <nav className="nav" aria-label="Fo navigacio">
            <NavLink to="/">Fooldal</NavLink>
            <NavLink to="/makettek">Makettek</NavLink>

            {!felhasznalo && <NavLink to="/bejelentkezes">Bejelentkezes</NavLink>}

            {felhasznalo && (
              <Link
                to="/profil"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <Avatar nev={felhasznalo.felhasznalo_nev} meret={28} />
                <span style={{ fontSize: "0.85rem" }}>
                  {felhasznalo.felhasznalo_nev}
                </span>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main>{gyerekek}</main>

      <footer className="footer">
        <div className="wrap">© {ev} Makett Velemenyezo</div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Elrendezes
      gyerekek={
        <Routes>
          <Route path="/" element={<Kezdolap />} />
          <Route path="/makettek" element={<Makettek />} />
          <Route path="/bejelentkezes" element={<Bejelentkezes />} />
          <Route path="/regisztracio" element={<Regisztracio />} />
          <Route path="/profil" element={<Profil />} />
        </Routes>
      }
    />
  );
}
