import React from "react";
import { Link } from "react-router-dom";
import { useAdat } from "../context/AdatContext";

function StatisztikaBadge() {
  const { makettek, velemenyek } = useAdat();

  const osszesMakett = makettek.length;
  const osszesVelemeny = velemenyek.length;

  const atlag =
    velemenyek.length > 0
      ? (
          velemenyek.reduce(
            (s, v) => s + (Number(v.ertekeles) || 0),
            0
          ) / velemenyek.length
        ).toFixed(1)
      : "—";

  return (
    <div className="badge">
      Makettek: {osszesMakett} • Velemenyek: {osszesVelemeny} • Atlag: {atlag}
    </div>
  );
}

export default function Kezdolap() {
  const { makettek, velemenyek } = useAdat();

  return (
    <section className="hero">
      <div className="wrap hero-inner">
        <div>
          <h2>Makett velemenyek katonai temaban</h2>
          <p>Tankok, hajok, repulok – keress es irj velemenyt.</p>

          <div className="row" style={{ marginTop: 14, display: "flex", gap: 10 }}>
            <Link className="btn" to="/bejelentkezes" style={{ maxWidth: 200, textAlign: "center" }}>
              Bejelentkezes
            </Link>
            <span className="badge">Demo projekt</span>
          </div>
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
          <StatisztikaBadge />
        </div>
      </div>
    </section>
  );
}
