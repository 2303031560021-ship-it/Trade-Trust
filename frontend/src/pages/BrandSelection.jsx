import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BrandSelection.css";

/* ===========================
   LOGO IMPORTS
=========================== */

import acer from "../assets/brands/acer.png";
import amazfit from "../assets/brands/amazfit.png";
import apple from "../assets/brands/apple.png";
import asus from "../assets/brands/asus.png";
import boat from "../assets/brands/boat.png";
import bosch from "../assets/brands/bosch.png";
import dell from "../assets/brands/dell.png";
import firebolt from "../assets/brands/firebolt.png";
import fossil from "../assets/brands/fossil.png";
import garmin from "../assets/brands/garmin.png";
import godrej from "../assets/brands/godrej.png";
import googlepixel from "../assets/brands/googlepixel.png";
import hisense from "../assets/brands/hisense.png";
import hp from "../assets/brands/hp.png";
import huawei from "../assets/brands/huawei.png";
import ifb from "../assets/brands/ifb.png";
import jbl from "../assets/brands/jbl.png";
import lenovo from "../assets/brands/lenovo.png";
import lg from "../assets/brands/lg.png";
import microsoft from "../assets/brands/microsoft.png";
import msi from "../assets/brands/msi.png";
import noise from "../assets/brands/noise.png";
import nokia from "../assets/brands/nokia.png";
import oneplus from "../assets/brands/oneplus.png";
import oppo from "../assets/brands/oppo.png";
import panasonic from "../assets/brands/panasonic.png";
import razor from "../assets/brands/razor.png";
import realme from "../assets/brands/realme.png";
import samsung from "../assets/brands/samsung.png";
import skullcandy from "../assets/brands/skullcandy.png";
import sony from "../assets/brands/sony.png";
import tcl from "../assets/brands/tcl.png";
import vivo from "../assets/brands/vivo.png";
import voltas from "../assets/brands/voltas.png";
import whirlpool from "../assets/brands/whirlpool.png";
import haier from "../assets/brands/haier.png";
import xiaomi from "../assets/brands/xiaomi.png";

/* ===========================
   BRAND LOGO MAPPING
=========================== */

const brandLogos = {
  Apple: apple,
  Samsung: samsung,
  OnePlus: oneplus,
  Xiaomi: xiaomi,
  Realme: realme,
  Vivo: vivo,
  Oppo: oppo,
  "Google Pixel": googlepixel,
  Dell: dell,
  HP: hp,
  Lenovo: lenovo,
  Asus: asus,
  Acer: acer,
  MSI: msi,
  Microsoft: microsoft,
  Huawei: huawei,
  Nokia: nokia,
  Sony: sony,
  LG: lg,
  TCL: tcl,
  Panasonic: panasonic,
  Hisense: hisense,
  Whirlpool: whirlpool,
  Haier: haier,
  Godrej: godrej,
  Bosch: bosch,
  Voltas: voltas,
  IFB: ifb,
  Garmin: garmin,
  Noise: noise,
  boAt: boat,
  "Fire-Boltt": firebolt,
  Fossil: fossil,
  Amazfit: amazfit,
  JBL: jbl,
  Razor: razor,
  Skullcandy: skullcandy,
  Mi: xiaomi
};

/* ===========================
   BRAND DATA
=========================== */

const brandData = {
  mobile: ["Apple", "Samsung", "OnePlus", "Xiaomi", "Realme", "Vivo", "Oppo", "Google Pixel"],
  laptop: ["Dell", "HP", "Lenovo", "Apple", "Asus", "Acer", "MSI", "Microsoft"],
  tablet: ["Apple", "Samsung", "Lenovo", "Xiaomi", "Microsoft", "Realme", "Huawei", "Nokia"],
  tv: ["Sony", "Samsung", "LG", "TCL", "Panasonic", "OnePlus", "Mi", "Hisense"],
  refrigerator: ["LG", "Samsung", "Whirlpool", "Haier", "Godrej", "Bosch", "Panasonic", "Voltas"],
  washing_machine: ["LG", "Samsung", "IFB", "Bosch", "Whirlpool", "Haier", "Godrej", "Panasonic"],
  smartwatch: ["Apple", "Samsung", "Garmin", "Noise", "boAt", "Fire-Boltt", "Fossil", "Amazfit"],
  earphones: ["Apple", "Sony", "JBL", "boAt", "Realme", "OnePlus", "Razor", "Skullcandy"]
};

/* ===========================
   COMPONENT
=========================== */

const BrandSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedCategory = location.state?.category;

  if (!selectedCategory) {
    navigate("/check");
    return null;
  }

  const brands = brandData[selectedCategory] || [];

  return (
    <div className="brand-page">
      <div className="brand-container">
        <header className="brand-header">
          <h1 className="brand-title">Select Brand</h1>
          <p className="brand-subtitle">
            Choose a brand for your {selectedCategory.replace("_", " ")}
          </p>
        </header>

        <div className="brand-grid">
          {brands.map((brand, index) => (
            <button
              key={index}
              className="brand-square-btn"
              style={{ "--order": index }}
              onClick={() => {
                const categoryKey = String(selectedCategory || "").toLowerCase();
                const routeBase =
                  categoryKey === "mobile"
                    ? "/second-hand/mobile"
                    : categoryKey === "laptop"
                    ? "/second-hand/laptop"
                    : categoryKey === "tablet"
                    ? "/tablet-second-hand"
                    : categoryKey === "tv"
                    ? "/second-hand/tv"
                    : categoryKey === "smartwatch"
                    ? "/second-hand/watch"
                    : categoryKey === "washing_machine"
                    ? "/second-hand/washing"
                    : categoryKey === "earphones"
                    ? "/second-hand/headphone"
                    : "/second-hand"; // fallback

                navigate(routeBase, {
                  state: { category: selectedCategory, brand }
                });
              }}
            >
              <img
                src={brandLogos[brand]}
                alt={brand}
                className="brand-logo"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandSelection;