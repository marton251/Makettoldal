import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAdat } from "../context/AdatContext";

const API_BASE_URL = "http://localhost:3001/api";

export default function EpitesiNaplo() {
  const { bejelentkezve } = useAuth();
  const { makettek, betoltesFolyamatban, betoltAlapAdatok } = useAdat();

  const [bejegyzesek, beallitBejegyzesek] = useState([]);
  const [betoltes, beallitBetoltes] = useState(false);
  const [hiba, beallitHiba] = useState(null);

  const [valasztottMakettId, beallitValasztottMakettId] = useState("");
  const [cim, beallitCim] = useState("");
  const [leiras, beallitLeiras] = useState("");
  const [kepUrl, beallitKepUrl] = useState("");

  useEffect(() => {
    betoltAlapAdatok();
  }, [betoltAlapAdatok]);

  async function betoltBejegyzesek() {
    try {
      beallitBetoltes(true);
      beallitHiba(null);
      const valasz = await fetch(`${API_BASE_URL}/epitesinaplo`);
      if (!valasz.ok) {
        const h = await valasz.json().catch(() => ({}));
        throw new Error(h.uzenet || "Nem sikerült betölteni az építési naplókat.");
      }
      const adat = await valasz.json();
      beallitBejegyzesek(adat);
    } catch (err) {
      beallitHiba(err.message);
    } finally {
      beallitBetoltes(false);
    }
  }

  useEffect(() => {
    betoltBejegyzesek();
  }, []);

  async function kezeliUjBejegyzesKuldes(e) {
    e.preventDefault();
    if (!bejelentkezve) {
      alert("Építési napló írásához jelentkezz be.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const valasz = await fetch(`${API_BASE_URL}/epitesinaplo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          makett_id: valasztottMakettId,
          cim,
          leiras,
          kep_url: kepUrl || null,
        }),
      });
      if (!valasz.ok) {
        const h = await valasz.json().catch(() => ({}));
        throw new Error(h.uzenet || "Hiba az építési napló mentésekor.");
      }
      const uj = await valasz.json();
      beallitBejegyzesek((elozo) => [uj, ...elozo]);
      beallitValasztottMakettId("");
      beallitCim("");
      beallitLeiras("");
      beallitKepUrl("");
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <section className="page">
      <h1>Építési naplók</h1>
      <p className="small">
        Oszd meg, hogyan haladsz a makettek építésével – képekkel és leírással.
      </p>

      {betoltesFolyamatban && <p>Makett adatok betöltése...</p>}
      {hiba && <p className="error">{hiba}</p>}

      {/* Új bejegyzés form */}
      <div className="card form">
        <h2>Új építési napló bejegyzés</h2>
        {!bejelentkezve && (
          <p className="small">
            Bejegyzés írásához előbb jelentkezz be.
          </p>
        )}
        <form onSubmit={kezeliUjBejegyzesKuldes}>
          <label>
            Makett
            <select
              value={valasztottMakettId}
              onChange={(e) => beallitValasztottMakettId(e.target.value)}
              required
            >
              <option value="">Válassz makettet...</option>
              {makettek.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nev} ({m.gyarto}, {m.skala})
                </option>
              ))}
            </select>
          </label>

          <label>
            Cím
            <input
              type="text"
              value={cim}
              onChange={(e) => beallitCim(e.target.value)}
              required
            />
          </label>

          <label>
            Leírás
            <textarea
              value={leiras}
              onChange={(e) => beallitLeiras(e.target.value)}
              rows={5}
              required
            />
          </label>

          <label>
            Kép URL (opcionális)
            <input
              type="url"
              placeholder="https://..."
              value={kepUrl}
              onChange={(e) => beallitKepUrl(e.target.value)}
            />
          </label>

          <button type="submit" className="btn">
            Bejegyzés mentése
          </button>
        </form>
      </div>

      {/* Bejegyzések listája */}
      <div className="card" style={{ marginTop: 16 }}>
        <h2>Összes bejegyzés</h2>
        {betoltes && <p>Betöltés...</p>}
        {bejegyzesek.length === 0 && !betoltes ? (
          <p>Még nincs egyetlen építési napló bejegyzés sem.</p>
        ) : (
          <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
            {bejegyzesek.map((b) => {
              const datum = b.letrehozva
                ? new Date(b.letrehozva).toLocaleString("hu-HU")
                : "";
              return (
                <li
                  key={b.id}
                  style={{
                    borderBottom: "1px solid #111827",
                    padding: "8px 0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <div>
                      <strong>{b.cim}</strong>
                      <p className="small" style={{ margin: 0 }}>
                        {b.makett_nev} ({b.gyarto}, {b.skala})
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p className="small" style={{ margin: 0 }}>
                        {b.felhasznalo_nev}
                      </p>
                      <p className="small" style={{ margin: 0 }}>
                        {datum}
                      </p>
                    </div>
                  </div>
                  <p style={{ marginTop: 4 }}>{b.leiras}</p>
                  {b.kep_url && (
                    <div className="makett-kep-wrapper" style={{ marginTop: 4 }}>
                      <img
                        src={b.kep_url}
                        alt={b.cim}
                        className="makett-kep"
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
