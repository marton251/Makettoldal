import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:3001/api";

export default function Forum() {
  const { bejelentkezve } = useAuth();

  const [temak, beallitTemak] = useState([]);
  const [kivalasztottTemaId, beallitKivalasztottTemaId] = useState(null);
  const [uzenetek, beallitUzenetek] = useState([]);

  const [ujTemaCim, beallitUjTemaCim] = useState("");
  const [ujTemaLeiras, beallitUjTemaLeiras] = useState("");
  const [ujTemaKategoria, beallitUjTemaKategoria] = useState("általános");

  const [ujUzenetSzoveg, beallitUjUzenetSzoveg] = useState("");
  const [temaKereses, beallitTemaKereses] = useState("");

  const [betoltes, beallitBetoltes] = useState(false);
  const [hiba, beallitHiba] = useState(null);

  // Témák betöltése
  async function betoltTemak() {
    try {
      beallitBetoltes(true);
      beallitHiba(null);
      const valasz = await fetch(`${API_BASE_URL}/forum/temak`);
      if (!valasz.ok) throw new Error("Nem sikerült lekérni a témákat.");
      const adat = await valasz.json();
      beallitTemak(adat);
    } catch (err) {
      beallitHiba(err.message);
    } finally {
      beallitBetoltes(false);
    }
  }

  // Kiválasztott téma üzenetei
  async function betoltUzenetek(temaId) {
    try {
      beallitBetoltes(true);
      beallitHiba(null);
      const valasz = await fetch(
        `${API_BASE_URL}/forum/temak/${temaId}/uzenetek`
      );
      if (!valasz.ok) {
        throw new Error("Nem sikerült lekérni a hozzászólásokat.");
      }
      const adat = await valasz.json();
      beallitUzenetek(adat);
    } catch (err) {
      beallitHiba(err.message);
    } finally {
      beallitBetoltes(false);
    }
  }

  useEffect(() => {
    betoltTemak();
  }, []);

  function kezeliTemaKivalasztas(temaId) {
    if (kivalasztottTemaId === temaId) {
      beallitKivalasztottTemaId(null);
      beallitUzenetek([]);
    } else {
      beallitKivalasztottTemaId(temaId);
      betoltUzenetek(temaId);
    }
  }

  // Új téma küldése
  async function kezeliUjTemaKuldes(e) {
    e.preventDefault();
    if (!bejelentkezve) {
      alert("Új téma indításához jelentkezz be.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const valasz = await fetch(`${API_BASE_URL}/forum/temak`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cim: ujTemaCim,
          leiras: ujTemaLeiras,
          kategoria: ujTemaKategoria,
        }),
      });
      if (!valasz.ok) {
        const h = await valasz.json().catch(() => ({}));
        throw new Error(h.uzenet || "Hiba az új téma létrehozásakor.");
      }
      const uj = await valasz.json();
      beallitTemak((elozo) => [uj, ...elozo]);
      beallitUjTemaCim("");
      beallitUjTemaLeiras("");
      beallitUjTemaKategoria("általános");
    } catch (err) {
      alert(err.message);
    }
  }

  // Új üzenet küldése
  async function kezeliUjUzenetKuldes(e) {
    e.preventDefault();
    if (!bejelentkezve) {
      alert("Hozzászóláshoz jelentkezz be.");
      return;
    }
    if (!kivalasztottTemaId) return;

    try {
      const token = localStorage.getItem("token");
      const valasz = await fetch(
        `${API_BASE_URL}/forum/temak/${kivalasztottTemaId}/uzenetek`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ szoveg: ujUzenetSzoveg }),
        }
      );
      if (!valasz.ok) {
        const h = await valasz.json().catch(() => ({}));
        throw new Error(h.uzenet || "Hiba a hozzászólás mentésekor.");
      }
      const uj = await valasz.json();
      beallitUzenetek((elozo) => [...elozo, uj]);
      beallitUjUzenetSzoveg("");
    } catch (err) {
      alert(err.message);
    }
  }

  // Témák szűrése keresőmező alapján
  const szurtTemak = useMemo(() => {
    const q = temaKereses.trim().toLowerCase();
    if (!q) return temak;

    return temak.filter((t) => {
      const cim = t.cim?.toLowerCase() || "";
      const leiras = t.leiras?.toLowerCase() || "";
      const kat = t.kategoria?.toLowerCase() || "";
      return (
        cim.includes(q) ||
        leiras.includes(q) ||
        kat.includes(q)
      );
    });
  }, [temak, temaKereses]);

  return (
    <section className="page">
      <h1>Fórum</h1>

      {hiba && <p className="error">{hiba}</p>}
      {betoltes && <p className="small">Betöltés...</p>}

      {/* Új téma form */}
      <div className="card form">
        <h2>Új téma indítása</h2>
        {!bejelentkezve && (
          <p className="small">
            Új téma indításához előbb jelentkezz be.
          </p>
        )}
        <form onSubmit={kezeliUjTemaKuldes}>
          <label>
            Cím
            <input
              type="text"
              value={ujTemaCim}
              onChange={(e) => beallitUjTemaCim(e.target.value)}
              required
            />
          </label>

          <label>
            Kategória
            <select
              value={ujTemaKategoria}
              onChange={(e) => beallitUjTemaKategoria(e.target.value)}
            >
              <option value="általános">Általános</option>
              <option value="építési napló">Építési napló</option>
              <option value="festés / weathering">Festés / weathering</option>
              <option value="kezdők kérdeznek">Kezdők kérdeznek</option>
              <option value="eszközök / anyagok">Eszközök / anyagok</option>
            </select>
          </label>

          <label>
            Leírás (nem kötelező)
            <textarea
              value={ujTemaLeiras}
              onChange={(e) => beallitUjTemaLeiras(e.target.value)}
            />
          </label>

          <button type="submit" className="btn">
            Téma létrehozása
          </button>
        </form>
      </div>

      {/* Témák listája */}
      <div className="card">
        <h2>Témák</h2>

        <div className="filters" style={{ marginBottom: 8 }}>
          <input
            type="text"
            placeholder="Témák keresése cím, leírás vagy kategória alapján..."
            value={temaKereses}
            onChange={(e) => beallitTemaKereses(e.target.value)}
          />
        </div>

        {szurtTemak.length === 0 ? (
          <p className="small">Nincs a keresésnek megfelelő téma.</p>
        ) : (
          <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
            {szurtTemak.map((t) => {
              const aktiv = t.id === kivalasztottTemaId;
              const datum = t.letrehozva
                ? new Date(t.letrehozva).toLocaleString("hu-HU")
                : "";
              return (
                <li
                  key={t.id}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px solid #111827",
                    cursor: "pointer",
                  }}
                  onClick={() => kezeliTemaKivalasztas(t.id)}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <div>
                      <strong>{t.cim}</strong>
                      {t.kategoria && (
                        <span className="nav-badge" style={{ marginLeft: 8 }}>
                          {t.kategoria}
                        </span>
                      )}
                      <p className="small" style={{ margin: 0 }}>
                        Indította: {t.felhasznalo_nev} – {datum}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p className="small" style={{ margin: 0 }}>
                        Hozzászólások: {t.uzenet_db}
                      </p>
                      {t.utolso_valasz && (
                        <p className="small" style={{ margin: 0 }}>
                          Utolsó:{" "}
                          {new Date(t.utolso_valasz).toLocaleDateString(
                            "hu-HU"
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  {aktiv && t.leiras && (
                    <p className="small" style={{ marginTop: 4 }}>
                      {t.leiras}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Kiválasztott téma hozzászólásai */}
      {kivalasztottTemaId && (
        <div className="card">
          <h2>Hozzászólások</h2>
          {uzenetek.length === 0 ? (
            <p className="small">Még nincs hozzászólás ebben a témában.</p>
          ) : (
            <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
              {uzenetek.map((u) => {
                const datum = u.letrehozva
                  ? new Date(u.letrehozva).toLocaleString("hu-HU")
                  : "";
                return (
                  <li
                    key={u.id}
                    style={{
                      padding: "8px 0",
                      borderBottom: "1px solid #111827",
                    }}
                  >
                    <p style={{ margin: 0 }}>
                      <strong>{u.felhasznalo_nev}</strong>
                    </p>
                    <p className="small" style={{ margin: 0 }}>
                      {datum}
                    </p>
                    <p style={{ marginTop: 4 }}>{u.szoveg}</p>
                  </li>
                );
              })}
            </ul>
          )}

          {bejelentkezve ? (
            <form
              onSubmit={kezeliUjUzenetKuldes}
              className="form"
              style={{ marginTop: 12 }}
            >
              <label>
                Új hozzászólás
                <textarea
                  value={ujUzenetSzoveg}
                  onChange={(e) => beallitUjUzenetSzoveg(e.target.value)}
                  required
                />
              </label>
              <button type="submit" className="btn">
                Küldés
              </button>
            </form>
          ) : (
            <p className="small" style={{ marginTop: 8 }}>
              Hozzászóláshoz jelentkezz be.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
