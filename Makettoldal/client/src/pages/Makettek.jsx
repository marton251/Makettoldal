import React, { useMemo, useState } from "react";
import { useAdat } from "../context/AdatContext";

function rajzolCsillagok(szam) {
  const egesz = Math.round(szam || 0);
  if (!egesz) return "—";
  return "⭐".repeat(egesz);
}

function MakettKartya({ makett, atlagErtekeles, megnyitVelemenyek }) {
  const nehezsegCsillagok = "⭐".repeat(makett.nehezseg || 1);

  return (
    <article className="card">
      {makett.kep_url ? (
        <img src={makett.kep_url} alt={makett.nev} />
      ) : (
        <img
          alt="Makett kep"
          src={`https://picsum.photos/seed/${encodeURIComponent(
            makett.nev
          )}/640/360`}
        />
      )}

      <div className="card-body">
        <div className="card-title">
          <div>
            <h3>{makett.nev}</h3>
            <div className="card-meta">
              {makett.gyarto} • {makett.skala} • {makett.kategori}
            </div>
          </div>
          <div className="card-rating">
            <span>{rajzolCsillagok(atlagErtekeles)}</span>
            <span className="small">
              {atlagErtekeles
                ? atlagErtekeles.toFixed(1)
                : "Nincs ertekeles"}
            </span>
          </div>
        </div>

        <div className="card-footer">
          <span className="badge">Nehezseg: {nehezsegCsillagok}</span>
          {makett.megjelenes_ev && (
            <span className="badge">Megjelenes: {makett.megjelenes_ev}</span>
          )}
        </div>

        <div className="card-actions" style={{ marginTop: 10 }}>
          <button className="btn" type="button" onClick={() => megnyitVelemenyek(makett)}>
            Velemenyek megtekintese / irasa
          </button>
        </div>
      </div>
    </article>
  );
}

function VelemenyLista({ velemenyek }) {
  if (!velemenyek.length) {
    return <p>Meg nincs velemeny ehhez a maketthez. Legyel te az elso!</p>;
  }

  return (
    <ul className="review-list">
      {velemenyek.map((v) => (
        <li key={v.id} className="review-item">
          <div className="review-header">
            <strong>{v.szerzo || "Nevenincs"}</strong>
            <span>{rajzolCsillagok(v.ertekeles)}</span>
          </div>
          <p>{v.szoveg}</p>
          <span className="small">
            {new Date(v.letrehozva).toLocaleString("hu-HU")}
          </span>
        </li>
      ))}
    </ul>
  );
}

function VelemenyUrlap({ kuldVelemeny, megse }) {
  const [szerzo, beallitSzerzo] = useState("");
  const [ertekeles, beallitErtekeles] = useState(5);
  const [szoveg, beallitSzoveg] = useState("");

  function kezelSubmit(k) {
    k.preventDefault();
    if (!szoveg.trim()) {
      alert("Kerjuk, irj szoveges velemenyt.");
      return;
    }

    kuldVelemeny({
      szerzo: szerzo.trim() || "Nevenincs",
      ertekeles: Number(ertekeles),
      szoveg: szoveg.trim(),
    });

    beallitSzerzo("");
    beallitErtekeles(5);
    beallitSzoveg("");
  }

  return (
    <form onSubmit={kezelSubmit} className="review-form">
      <div className="form-row">
        <label className="small">Nev (nem kotelezo)</label>
        <input
          className="input"
          value={szerzo}
          onChange={(e) => beallitSzerzo(e.target.value)}
          placeholder="Pl. Makett Rajongo"
        />
      </div>

      <div className="form-row">
        <label className="small">Ertekeles</label>
        <select
          className="input"
          value={ertekeles}
          onChange={(e) => beallitErtekeles(Number(e.target.value))}
        >
          <option value={5}>5 - Kivalo</option>
          <option value={4}>4 - Jo</option>
          <option value={3}>3 - Kozepes</option>
          <option value={2}>2 - Gyenge</option>
          <option value={1}>1 - Rossz</option>
        </select>
      </div>

      <div className="form-row">
        <label className="small">Velemeny</label>
        <textarea
          className="input"
          rows={3}
          value={szoveg}
          onChange={(e) => beallitSzoveg(e.target.value)}
          placeholder="Ird le a tapasztalataid: illeszkedes, reszletesseg, matrica, stb."
        />
      </div>

      <div
        className="form-row"
        style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}
      >
        <button className="btn" type="submit">
          Velemeny elkuldese
        </button>
        <button className="btn" type="button" onClick={megse}>
          Megse
        </button>
      </div>
    </form>
  );
}

function ModalisAblak({ cim, bezar, gyerekek }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>{cim}</h3>
          <button
            className="btn"
            type="button"
            onClick={bezar}
            aria-label="Bezaras"
          >
            X
          </button>
        </div>
        <div className="modal-body">{gyerekek}</div>
      </div>
    </div>
  );
}

export default function Makettek() {
  const { makettek, velemenyek, betoltesFolyamatban, szamolAtlagErtekeles, hozzaadVelemeny } = useAdat();

  const [kereses, beallitKereses] = useState("");
  const [kategoriSzuro, beallitKategoriSzuro] = useState("osszes");
  const [skalaSzuro, beallitSkalaSzuro] = useState("osszes");
  const [rendezes, beallitRendezes] = useState("ertekeles-csokkeno");

  const [kivalasztottMakett, beallitKivalasztottMakett] = useState(null);
  const [urlapLathato, beallitUrlapLathato] = useState(false);

  const szurtMakettek = useMemo(() => {
    let lista = makettek.map((m) => ({
      ...m,
      atlagErtekeles: szamolAtlagErtekeles(m.id),
    }));

    const q = kereses.trim().toLowerCase();
    if (q) {
      lista = lista.filter(
        (m) =>
          m.nev.toLowerCase().includes(q) ||
          m.gyarto.toLowerCase().includes(q)
      );
    }

    if (kategoriSzuro !== "osszes") {
      lista = lista.filter((m) => m.kategori === kategoriSzuro);
    }

    if (skalaSzuro !== "osszes") {
      lista = lista.filter((m) => m.skala === skalaSzuro);
    }

    switch (rendezes) {
      case "ertekeles-csokkeno":
        lista.sort(
          (a, b) => (b.atlagErtekeles || 0) - (a.atlagErtekeles || 0)
        );
        break;
      case "megjelenes-ujabb":
        lista.sort(
          (a, b) => (b.megjelenes_ev || 0) - (a.megjelenes_ev || 0)
        );
        break;
      case "nehezseg-novekvo":
        lista.sort((a, b) => (a.nehezseg || 0) - (b.nehezseg || 0));
        break;
      default:
        break;
    }

    return lista;
  }, [makettek, kereses, kategoriSzuro, skalaSzuro, rendezes, szamolAtlagErtekeles]);

  const kivalasztottMakettVelemenyek = useMemo(() => {
    if (!kivalasztottMakett) return [];
    return velemenyek.filter((v) => v.makett_id === kivalasztottMakett.id);
  }, [velemenyek, kivalasztottMakett]);

  function kezeliVelemenyekMegnyitasat(makett) {
    beallitKivalasztottMakett(makett);
    beallitUrlapLathato(false);
  }

  function bezarModalis() {
    beallitKivalasztottMakett(null);
    beallitUrlapLathato(false);
  }

  function kuldUjVelemeny(adat) {
    if (!kivalasztottMakett) return;
    hozzaadVelemeny({
      makett_id: kivalasztottMakett.id,
      szerzo: adat.szerzo,
      ertekeles: adat.ertekeles,
      szoveg: adat.szoveg,
    });
    beallitUrlapLathato(false);
  }

  return (
    <>
      <section className="hero hero-small">
        <div className="wrap hero-inner">
          <div>
            <h2>Makettek</h2>
            <p>Bongess a makettek kozott, szurj, rendezz es irj velemenyt.</p>
          </div>

          <div className="hero-card">
            <div className="row">
              <div className="kpi">
                <span className="small">Makettek</span>
                <span className="val">{makettek.length}</span>
              </div>
              <div className="kpi">
                <span className="small">Velemenyek</span>
                <span className="val">{velemenyek.length}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="toolbar">
        <div className="wrap grid">
          <div className="cell">
            <input
              className="input"
              placeholder="Kereses nev vagy gyarto szerint..."
              value={kereses}
              onChange={(e) => beallitKereses(e.target.value)}
            />
          </div>

          <div className="cell">
            <select
              className="input"
              value={kategoriSzuro}
              onChange={(e) => beallitKategoriSzuro(e.target.value)}
            >
              <option value="osszes">Kategoria: osszes</option>
              <option value="tank">Tank</option>
              <option value="hajo">Hajo</option>
              <option value="repulo">Repulo</option>
            </select>
          </div>

          <div className="cell">
            <select
              className="input"
              value={skalaSzuro}
              onChange={(e) => beallitSkalaSzuro(e.target.value)}
            >
              <option value="osszes">Skala: osszes</option>
              <option value="1:35">1:35</option>
              <option value="1:48">1:48</option>
              <option value="1:72">1:72</option>
              <option value="1:700">1:700</option>
            </select>
          </div>

          <div className="cell">
            <select
              className="input"
              value={rendezes}
              onChange={(e) => beallitRendezes(e.target.value)}
            >
              <option value="ertekeles-csokkeno">Rendezes: ertekeles ↓</option>
              <option value="megjelenes-ujabb">Rendezes: megjelenes ↓</option>
              <option value="nehezseg-novekvo">Rendezes: nehezseg ↑</option>
            </select>
          </div>
        </div>
      </section>

      <main className="wrap grid-cards">
        {betoltesFolyamatban ? (
          <p>Adatok betoltese...</p>
        ) : szurtMakettek.length === 0 ? (
          <p>Nincs talalat a megadott szurokkel.</p>
        ) : (
          szurtMakettek.map((makett) => (
            <MakettKartya
              key={makett.id}
              makett={makett}
              atlagErtekeles={makett.atlagErtekeles}
              megnyitVelemenyek={kezeliVelemenyekMegnyitasat}
            />
          ))
        )}
      </main>

      {kivalasztottMakett && (
        <ModalisAblak
          cim={`Velemenyek: ${kivalasztottMakett.nev}`}
          bezar={bezarModalis}
          gyerekek={
            <>
              <VelemenyLista velemenyek={kivalasztottMakettVelemenyek} />

              {!urlapLathato ? (
                <div style={{ marginTop: 12 }}>
                  <button
                    className="btn"
                    type="button"
                    onClick={() => beallitUrlapLathato(true)}
                  >
                    Uj velemeny irasa
                  </button>
                </div>
              ) : (
                <VelemenyUrlap
                  kuldVelemeny={kuldUjVelemeny}
                  megse={() => beallitUrlapLathato(false)}
                />
              )}
            </>
          }
        />
      )}
    </>
  );
}
