import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_ALAP = "http://localhost:3001/api";

export default function Bejelentkezes() {
  const navigacio = useNavigate();
  const { bejelentkezve } = useAuth();
  const [hibaUzenet, beallitHibaUzenet] = useState("");

  async function kezelBejelentkezes(e) {
    e.preventDefault();

    const urlapAdat = new FormData(e.target);
    const email = String(urlapAdat.get("email") || "").trim();
    const jelszo = String(urlapAdat.get("jelszo") || "");

    if (!email || !jelszo) {
      beallitHibaUzenet("Kerjuk, toltson ki minden mezot.");
      return;
    }

    try {
      const valasz = await fetch(`${API_ALAP}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, jelszo }),
      });

      if (!valasz.ok) {
        const hiba = await valasz.json().catch(() => ({}));
        beallitHibaUzenet(hiba.hiba || "Hibas bejelentkezesi adatok.");
        return;
      }

      const adat = await valasz.json();

      // token eltarolasa
      localStorage.setItem("token", adat.token);

      // felhasznalo adatok eltarolasa
      localStorage.setItem("felhasznalo_nev", adat.felhasznalo.felhasznalo_nev);
      if (adat.felhasznalo.email) {
        localStorage.setItem("felhasznalo_email", adat.felhasznalo.email);
      }

      // AuthContext ertesitese
      bejelentkezve({
        felhasznalo_nev: adat.felhasznalo.felhasznalo_nev,
        email: adat.felhasznalo.email || "",
      });

      beallitHibaUzenet("");
      navigacio("/"); // fooldalra vissza
    } catch (hiba) {
      console.error("Bejelentkezesi hiba:", hiba);
      beallitHibaUzenet("Szerver hiba, probalja ujra kesobb.");
    }
  }

  return (
    <section className="hero hero-small">
      <div className="wrap hero-inner">
        <div className="auth-card">
          <h2>Bejelentkezes</h2>

          {hibaUzenet && (
            <p className="small" style={{ color: "#f97316", marginTop: 4 }}>
              {hibaUzenet}
            </p>
          )}

          <form onSubmit={kezelBejelentkezes}>
            <div className="form-row">
              <label className="small" htmlFor="email">
                E-mail
              </label>
              <input
                className="input"
                id="email"
                name="email"
                type="email"
                required
              />
            </div>

            <div className="form-row">
              <label className="small" htmlFor="jelszo">
                Jelszo
              </label>
              <input
                className="input"
                id="jelszo"
                name="jelszo"
                type="password"
                required
                placeholder="••••••••"
              />
            </div>

            <div
              className="form-actions"
              style={{ marginTop: 10, display: "flex", gap: 8 }}
            >
              <button className="btn" type="submit">
                Belep
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => navigacio(-1)}
              >
                Vissza
              </button>
            </div>

            <p className="small" style={{ marginTop: 8 }}>
              Nincs fiokod? <Link to="/regisztracio">Regisztracio</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
