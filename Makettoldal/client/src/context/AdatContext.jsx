import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AdatContext = createContext(null);

const API_ALAP = "http://localhost:3001/api";

export function AdatProvider({ children }) {
  const [makettek, beallitMakettek] = useState([]);
  const [velemenyek, beallitVelemenyek] = useState([]);
  const [betoltesFolyamatban, beallitBetoltesFolyamatban] = useState(true);

  useEffect(() => {
    async function betoltAdatokat() {
      try {
        const valaszMakettek = await fetch(`${API_ALAP}/makettek`);
        const makettAdatok = await valaszMakettek.json();

        const osszesVelemeny = [];
        for (const makett of makettAdatok) {
          const valaszVelemenyek = await fetch(
            `${API_ALAP}/makettek/${makett.id}/velemenyek`
          );
          const velemenyAdatok = await valaszVelemenyek.json();
          osszesVelemeny.push(...velemenyAdatok);
        }

        beallitMakettek(makettAdatok);
        beallitVelemenyek(osszesVelemeny);
      } catch (hiba) {
        console.error("Hiba az adatok betoltese kozben:", hiba);
      } finally {
        beallitBetoltesFolyamatban(false);
      }
    }

    betoltAdatokat();
  }, []);

  const ertek = useMemo(() => {
    function szamolAtlagErtekeles(makettId) {
      const lista = velemenyek.filter((v) => v.makett_id === makettId);
      if (!lista.length) return 0;
      const osszeg = lista.reduce(
        (s, v) => s + (Number(v.ertekeles) || 0),
        0
      );
      return osszeg / lista.length;
    }

    async function hozzaadMakett(ujMakett) {
      const valasz = await fetch(`${API_ALAP}/makettek`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ujMakett),
      });

      if (!valasz.ok) {
        alert("Hiba tortent a makett mentesekor.");
        return;
      }

      const letrehozott = await valasz.json();
      beallitMakettek((elozo) => [letrehozott, ...elozo]);
    }

    async function hozzaadVelemeny(ujVelemeny) {
      const token = localStorage.getItem("token");
      const fejlec = { "Content-Type": "application/json" };
      if (token) {
        fejlec["Authorization"] = `Bearer ${token}`;
      }

      const valasz = await fetch(
        `${API_ALAP}/makettek/${ujVelemeny.makett_id}/velemenyek`,
        {
          method: "POST",
          headers: fejlec,
          body: JSON.stringify({
            szerzo: ujVelemeny.szerzo,
            ertekeles: ujVelemeny.ertekeles,
            szoveg: ujVelemeny.szoveg,
          }),
        }
      );

      if (!valasz.ok) {
        alert("Hiba tortent a velemeny mentesekor.");
        return;
      }

      const letrehozott = await valasz.json();
      beallitVelemenyek((elozo) => [letrehozott, ...elozo]);
    }

    return {
      makettek,
      velemenyek,
      betoltesFolyamatban,
      szamolAtlagErtekeles,
      hozzaadMakett,
      hozzaadVelemeny,
    };
  }, [makettek, velemenyek, betoltesFolyamatban]);

  return (
    <AdatContext.Provider value={ertek}>{children}</AdatContext.Provider>
  );
}

export function useAdat() {
  const ctx = useContext(AdatContext);
  if (!ctx) throw new Error("useAdat csak AdatProvider-en belul hasznalhato");
  return ctx;
}
