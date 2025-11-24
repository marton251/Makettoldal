import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:3001/api";

export default function Kedvencek() {
  const { bejelentkezve } = useAuth();
  const [makettek, beallitMakettek] = useState([]);
  const [betoltes, beallitBetoltes] = useState(false);
  const [hiba, beallitHiba] = useState(null);

  async function betoltKedvencek() {
    try {
      beallitBetoltes(true);
      beallitHiba(null);
      const token = localStorage.getItem("token");
      const valasz = await fetch(`${API_BASE_URL}/kedvencek`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!valasz.ok) {
        const h = await valasz.json().catch(() => ({}));
        throw new Error(h.uzenet || "Nem sikerült betölteni a kedvenceket.");
      }
      const adat = await valasz.json();
      beallitMakettek(adat);
    } catch (err) {
      beallitHiba(err.message);
    } finally {
      beallitBetoltes(false);
    }
  }

  useEffect(() => {
    if (bejelentkezve) {
      betoltKedvencek();
    }
  }, [bejelentkezve]);

  async function kezeliEltavolitas(makettId) {
    if (!window.confirm("Biztosan eltávolítod a kedvencek közül?")) return;
    try {
      const token = localStorage.getItem("token");
      const valasz = await fetch(`${API_BASE_URL}/kedvencek/${makettId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!valasz.ok) {
        const h = await valasz.json().catch(() => ({}));
        throw new Error(h.uzenet || "Nem sikerült módosítani a kedvenceket.");
      }
      beallitMakettek((elozo) => elozo.filter((m) => m.makett_id !== makettId));
    } catch (err) {
      alert(err.message);
    }
  }

  if (!bejelentkezve) {
    return (
      <section className="page">
        <h1>Kedvenc makettjeim</h1>
        <p>Kérlek jelentkezz be, hogy lásd a kedvenc makettjeidet.</p>
        <Link to="/bejelentkezes" className="btn">
          Bejelentkezés
        </Link>
      </section>
    );
  }

  return (
    <section className="page">
      <h1>Kedvenc makettjeim</h1>
      {betoltes && <p>Betöltés...</p>}
      {hiba && <p className="error">{hiba}</p>}

      {makettek.length === 0 && !betoltes ? (
        <p>Még nincs egyetlen kedvenc maketted sem.</p>
      ) : (
        <section className="card-grid">
          {makettek.map((m) => (
            <article key={m.makett_id} className="card makett-card">
              <h2>{m.nev}</h2>
              <p className="small">
                {m.gyarto} • {m.skala} • {m.kategoria}
              </p>
              {m.kep_url && (
                <div className="makett-kep-wrapper">
                  <img
                    src={m.kep_url}
                    alt={m.nev}
                    className="makett-kep"
                  />
                </div>
              )}
              <div className="button-row">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => kezeliEltavolitas(m.makett_id)}
                >
                  Eltávolítás a kedvencek közül
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      <div style={{ marginTop: 12 }}>
        <Link to="/makettek" className="btn secondary">
          Vissza a makettekhez
        </Link>
      </div>
    </section>
  );
}
