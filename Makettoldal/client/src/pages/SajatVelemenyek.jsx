import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:3001/api";

export default function SajatVelemenyek() {
  const { bejelentkezve } = useAuth();
  const [velemenyek, beallitVelemenyek] = useState([]);
  const [betoltes, beallitBetoltes] = useState(false);
  const [hiba, beallitHiba] = useState(null);

  useEffect(() => {
    if (!bejelentkezve) return;

    async function betolt() {
      try {
        beallitBetoltes(true);
        beallitHiba(null);
        const token = localStorage.getItem("token");
        const valasz = await fetch(`${API_BASE_URL}/sajat/velemenyek`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!valasz.ok) {
          const h = await valasz.json().catch(() => ({}));
          throw new Error(h.uzenet || "Nem sikerült betölteni a véleményeket.");
        }
        const adat = await valasz.json();
        beallitVelemenyek(adat);
      } catch (err) {
        beallitHiba(err.message);
      } finally {
        beallitBetoltes(false);
      }
    }

    betolt();
  }, [bejelentkezve]);

  if (!bejelentkezve) {
    return (
      <section className="page">
        <h1>Saját véleményeim</h1>
        <p>Kérlek jelentkezz be, hogy lásd a saját véleményeidet.</p>
        <Link to="/bejelentkezes" className="btn">
          Bejelentkezés
        </Link>
      </section>
    );
  }

  return (
    <section className="page">
      <h1>Saját véleményeim</h1>
      <p className="small">
        Itt látod az összes véleményt, amit makettekről írtál.
      </p>

      {betoltes && <p>Betöltés...</p>}
      {hiba && <p className="error">{hiba}</p>}

      {velemenyek.length === 0 && !betoltes ? (
        <p>Még nem írtál véleményt egyetlen makettről sem.</p>
      ) : (
        <div className="card">
          <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
            {velemenyek.map((v) => {
              const datum = v.letrehozva
                ? new Date(v.letrehozva).toLocaleString("hu-HU")
                : "";
              return (
                <li
                  key={v.id}
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
                      <strong>{v.makett_nev}</strong>{" "}
                      <span className="small">({v.gyarto})</span>
                      <p className="small" style={{ margin: 0 }}>
                        {v.skala} • {v.kategoria}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p className="small" style={{ margin: 0 }}>
                        Értékelés: {v.ertekeles}/5
                      </p>
                      <p className="small" style={{ margin: 0 }}>
                        {datum}
                      </p>
                    </div>
                  </div>
                  <p style={{ marginTop: 4 }}>{v.szoveg}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <Link to="/makettek" className="btn secondary">
          Vissza a makettekhez
        </Link>
      </div>
    </section>
  );
}
