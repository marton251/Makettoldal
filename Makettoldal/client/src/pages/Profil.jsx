import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function generalSzin(nev) {
  if (!nev) return "#4b5563";
  let hash = 0;
  for (let i = 0; i < nev.length; i++) {
    hash = nev.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 45%)`;
}

function AvatarNagy({ nev }) {
  if (!nev) nev = "P";

  const fileKulcs = "profil_kep_file_" + nev;
  const urlKulcs = "profil_kep_url_" + nev;

  const fileAdat = typeof window !== "undefined" ? localStorage.getItem(fileKulcs) : null;
  const urlAdat = typeof window !== "undefined" ? localStorage.getItem(urlKulcs) : null;

  const stilus = {
    width: 96,
    height: 96,
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 40,
    background: generalSzin(nev),
    color: "#f9fafb",
    overflow: "hidden",
    marginBottom: 8,
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

export default function Profil() {
  const { felhasznalo, kijelentkezes } = useAuth();
  const [kepUrl, beallitKepUrl] = useState("");
  const [profil, beallitProfil] = useState({
    becenev: "",
    bemutatkozas: "",
    kedvencSkala: "",
    kedvencTema: "",
  });

  if (!felhasznalo) {
    return (
      <div className="wrap" style={{ padding: 16 }}>
        <h2>Nincs bejelentkezve</h2>
        <p>Profil megtekintesehez jelentkezzen be.</p>
      </div>
    );
  }

  const nev = felhasznalo.felhasznalo_nev;
  const kulcsKepUrl = "profil_kep_url_" + nev;
  const kulcsKepFile = "profil_kep_file_" + nev;
  const kulcsProfil = "profil_adatok_" + nev;

  useEffect(() => {
    const url = localStorage.getItem(kulcsKepUrl);
    if (url) beallitKepUrl(url);

    const adatStr = localStorage.getItem(kulcsProfil);
    if (adatStr) {
      try {
        const obj = JSON.parse(adatStr);
        beallitProfil((r) => ({ ...r, ...obj }));
      } catch (e) {
        console.warn("Hibas profil JSON:", e);
      }
    }
  }, [kulcsKepUrl, kulcsProfil]);

  function kezeliKepFajlValasztast(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const adatUrl = reader.result;
      localStorage.setItem(kulcsKepFile, adatUrl);
      // ha fajl van, URL-t nem toroljuk, de a preview-t a file fogja adni
      // csak egy teszt alert:
      alert("Profilkep fajl elmentve.");
    };
    reader.readAsDataURL(file);
  }

  function kezeliKepUrlMentes() {
    localStorage.setItem(kulcsKepUrl, kepUrl.trim());
    alert("Profilkep URL elmentve.");
  }

  function kezeliProfilValtozast(mezo, ertek) {
    beallitProfil((elozo) => ({ ...elozo, [mezo]: ertek }));
  }

  function kezeliProfilMentes() {
    localStorage.setItem(kulcsProfil, JSON.stringify(profil));
    alert("Profil adatok elmentve.");
  }

  function kezeliKijelentkezes() {
    kijelentkezes();
  }

  return (
    <div className="wrap" style={{ padding: 16, maxWidth: 700 }}>
      <h2>Profil</h2>

      <div
        style={{
          display: "flex",
          gap: 20,
          alignItems: "flex-start",
          marginTop: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <AvatarNagy nev={nev} />
          <p style={{ margin: 0, fontWeight: "bold" }}>{nev}</p>
          <p className="small" style={{ marginTop: 2 }}>
            {felhasznalo.email}
          </p>
        </div>

        <div style={{ flex: 1, minWidth: 260 }}>
          <h3>Profilkep beallitasa</h3>

          <div className="form-row">
            <label className="small">Kep feltoltese fajlbol</label>
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={kezeliKepFajlValasztast}
            />
          </div>

          <div className="form-row" style={{ marginTop: 8 }}>
            <label className="small">Kep URL megadása (opcionalis)</label>
            <input
              className="input"
              value={kepUrl}
              onChange={(e) => beallitKepUrl(e.target.value)}
              placeholder="https://..."
            />
            <button
              className="btn"
              type="button"
              style={{ marginTop: 6 }}
              onClick={kezeliKepUrlMentes}
            >
              URL mentese
            </button>
          </div>
        </div>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <div style={{ display: "grid", gap: 10 }}>
        <h3>Profil adatok</h3>

        <div className="form-row">
          <label className="small">Becenev</label>
          <input
            className="input"
            value={profil.becenev}
            onChange={(e) => kezeliProfilValtozast("becenev", e.target.value)}
            placeholder="Pl. xZokniHUN"
          />
        </div>

        <div className="form-row">
          <label className="small">Bemutatkozas</label>
          <textarea
            className="input"
            rows={3}
            value={profil.bemutatkozas}
            onChange={(e) =>
              kezeliProfilValtozast("bemutatkozas", e.target.value)
            }
            placeholder="Ird le roviden, ki vagy, milyen maketteket szeretsz..."
          />
        </div>

        <div className="form-row">
          <label className="small">Kedvenc makett skala</label>
          <select
            className="input"
            value={profil.kedvencSkala}
            onChange={(e) =>
              kezeliProfilValtozast("kedvencSkala", e.target.value)
            }
          >
            <option value="">Nincs megadva</option>
            <option value="1:35">1:35</option>
            <option value="1:48">1:48</option>
            <option value="1:72">1:72</option>
            <option value="1:700">1:700</option>
          </select>
        </div>

        <div className="form-row">
          <label className="small">Kedvenc tema (pl. tank, hajo...)</label>
          <input
            className="input"
            value={profil.kedvencTema}
            onChange={(e) =>
              kezeliProfilValtozast("kedvencTema", e.target.value)
            }
            placeholder="Pl. WWII tankok, modern repulok..."
          />
        </div>

        <div
          className="form-row"
          style={{ display: "flex", gap: 8, marginTop: 10 }}
        >
          <button className="btn" type="button" onClick={kezeliProfilMentes}>
            Profil mentese
          </button>
          <button
            className="btn"
            type="button"
            onClick={kezeliKijelentkezes}
          >
            Kijelentkezes
          </button>
        </div>
      </div>
    </div>
  );
}
