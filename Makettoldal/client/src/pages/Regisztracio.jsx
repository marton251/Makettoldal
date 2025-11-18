import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_ALAP = "http://localhost:3001/api";

export default function Regisztracio() {
  const navigacio = useNavigate();
  const [hibaUzenet, beallitHibaUzenet] = useState("");

  async function kezelRegisztracio(k) {
    k.preventDefault();
    const urlapAdat = new FormData(k.target);

    const vezeteknev = String(urlapAdat.get("vezeteknev") || "").trim();
    const keresztnev = String(urlapAdat.get("keresztnev") || "").trim();
    const becenev = String(urlapAdat.get("becenev") || "").trim();
    const email = String(urlapAdat.get("email") || "").trim();
    const jelszo = String(urlapAdat.get("jelszo") || "");
    const jelszoUjra = String(urlapAdat.get("jelszoUjra") || "");
    const kedvencSkala = String(urlapAdat.get("kedvencSkala") || "");
    const feltetelekElfogadva = urlapAdat.get("feltetelek") === "on";

    if (!vezeteknev || !keresztnev || !email || !jelszo || !jelszoUjra) {
      beallitHibaUzenet("Kerjuk, toltson ki minden kotelezo mezot.");
      return;
    }

    if (jelszo.length < 6) {
      beallitHibaUzenet("A jelszo legalabb 6 karakter legyen.");
      return;
    }

    if (jelszo !== jelszoUjra) {
      beallitHibaUzenet("A ket jelszo nem egyezik.");
      return;
    }

    if (!feltetelekElfogadva) {
      beallitHibaUzenet("A regisztraciohoz el kell fogadni a felteteleket.");
      return;
    }

    try {
      const felhasznalo_nev = becenev || `${vezeteknev}_${keresztnev}`;

      const valasz = await fetch(`${API_ALAP}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          felhasznalo_nev,
          email,
          jelszo,
          kedvencSkala,
        }),
      });

      if (!valasz.ok) {
        const hiba = await valasz.json().catch(() => ({}));
        beallitHibaUzenet(hiba.hiba || "Regisztracios hiba tortent.");
        return;
      }

      beallitHibaUzenet("");
      alert("Sikeres regisztracio, most mar be tud lepni.");
      navigacio("/bejelentkezes");
    } catch (hiba) {
      console.error("Regisztracios hiba:", hiba);
      beallitHibaUzenet("Szerver hiba, probalja ujra kesobb.");
    }
  }

  return (
    <section className="hero hero-small">
      <div className="wrap hero-inner">
        <div className="auth-card">
          <h2>Regisztracio</h2>
          <p className="small">Regisztracio valodi adatbazis kapcsolat mellett.</p>

          {hibaUzenet && (
            <p
              className="small"
              style={{ color: "#f97316", marginTop: 8, marginBottom: 4 }}
            >
              {hibaUzenet}
            </p>
          )}

          <form onSubmit={kezelRegisztracio}>
            <div className="form-row">
              <label className="small" htmlFor="vezeteknev">
                Vezeteknev *
              </label>
              <input className="input" id="vezeteknev" name="vezeteknev" />
            </div>

            <div className="form-row">
              <label className="small" htmlFor="keresztnev">
                Keresztnev *
              </label>
              <input className="input" id="keresztnev" name="keresztnev" />
            </div>

            <div className="form-row">
              <label className="small" htmlFor="becenev">
                Becenev (opcionalis)
              </label>
              <input
                className="input"
                id="becenev"
                name="becenev"
                placeholder="Pl. xZokniHUN"
              />
            </div>

            <div className="form-row">
              <label className="small" htmlFor="email">
                E-mail *
              </label>
              <input
                className="input"
                id="email"
                name="email"
                type="email"
                placeholder="te@pelda.hu"
              />
            </div>

            <div className="form-row">
              <label className="small" htmlFor="jelszo">
                Jelszo * (min. 6 karakter)
              </label>
              <input
                className="input"
                id="jelszo"
                name="jelszo"
                type="password"
                placeholder="••••••••"
              />
            </div>

            <div className="form-row">
              <label className="small" htmlFor="jelszoUjra">
                Jelszo ujra *
              </label>
              <input
                className="input"
                id="jelszoUjra"
                name="jelszoUjra"
                type="password"
                placeholder="••••••••"
              />
            </div>

            <div className="form-row">
              <label className="small" htmlFor="kedvencSkala">
                Kedvenc makett skala
              </label>
              <select
                className="input"
                id="kedvencSkala"
                name="kedvencSkala"
              >
                <option value="">Nincs megadva</option>
                <option value="1:35">1:35</option>
                <option value="1:48">1:48</option>
                <option value="1:72">1:72</option>
                <option value="1:700">1:700</option>
              </select>
            </div>

            <div className="form-row" style={{ marginTop: 8 }}>
              <label style={{ fontSize: "0.8rem" }}>
                <input
                  type="checkbox"
                  name="feltetelek"
                  style={{ marginRight: 6 }}
                />
                Elfogadom az adatkezelesi tajekoztatot es a felhasznalasi
                felteteleket. *
              </label>
            </div>

            <div
              className="form-row"
              style={{ marginTop: 12, display: "flex", gap: 8 }}
            >
              <button className="btn" type="submit">
                Regisztral
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
              Mar van fiokod? <Link to="/bejelentkezes">Bejelentkezes</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
