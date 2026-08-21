import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./CheckType.css";

import phoneImg from "../assets/phone.png";
import laptopImg from "../assets/laptop.png";
import watchImg from "../assets/watch.png";
import headphoneImg from "../assets/headphone.png";
import wmImg from "../assets/washingmachine.png";
import tvImg from "../assets/tv.png";

import phoneHoverImg from "../assets/card1.png";
import laptopHoverImg from "../assets/card2.png";
import tabletHoverImg from "../assets/tablet.png";
import tvHoverImg from "../assets/card4.png";
import washingHoverImg from "../assets/card6.png";
import watchHoverImg from "../assets/card7.png";
import headphoneHoverImg from "../assets/card8.png";

const categories = [
  { key: "mobile", label: "Mobile Phones", img: phoneHoverImg },
  { key: "laptop", label: "Laptops", img: laptopHoverImg },
  { key: "tablet", label: "Tablets", img: tabletHoverImg },
  { key: "tv", label: "Televisions", img: tvHoverImg },
  { key: "washing_machine", label: "Washing Machines", img: washingHoverImg },
  { key: "smartwatch", label: "Smartwatches", img: watchHoverImg },
  { key: "earphones", label: "Headphones", img: headphoneHoverImg }
];

const CheckType = () => {
  const navigate = useNavigate();
  const assetRefs = useRef([]);

  useEffect(() => {
    const assets = assetRefs.current.filter(Boolean);
    const navbarHeight =
      document.querySelector(".navbar")?.getBoundingClientRect().bottom || 0;

    let velocities = assets.map((_, i) => ({
      x: (Math.random() > 0.5 ? 1 : -1) * (i < 3 ? 0.35 : 0.15),
      y: (Math.random() > 0.5 ? 1 : -1) * (i < 3 ? 0.35 : 0.15)
    }));

    const startPos = [
      { l: 5, t: 15 },
      { l: 80, t: 70 },
      { l: 15, t: 80 },
      { l: 75, t: 15 },
      { l: 45, t: 10 },
      { l: 50, t: 80 }
    ];

    assets.forEach((el, i) => {
      if (!el) return;
      el.style.left = `${startPos[i].l}%`;
      el.style.top = `${startPos[i].t}%`;
    });

    const move = () => {
      assets.forEach((el, i) => {
        if (!el) return;

        const rect = el.getBoundingClientRect();
        let nextX = rect.left + velocities[i].x;
        let nextY = rect.top + velocities[i].y;

        if (nextX <= 0 || nextX + rect.width >= window.innerWidth) {
          velocities[i].x *= -1;
        }
        if (nextY <= navbarHeight || nextY + rect.height >= window.innerHeight) {
          velocities[i].y *= -1;
        }

        el.style.left = `${nextX}px`;
        el.style.top = `${nextY}px`;
      });

      requestAnimationFrame(move);
    };

    const animId = requestAnimationFrame(move);
    return () => cancelAnimationFrame(animId);
  }, []);

  const assetList = [
    { src: phoneImg, class: "asset-phone" },
    { src: laptopImg, class: "asset-laptop" },
    { src: watchImg, class: "asset-watch" },
    { src: headphoneImg, class: "asset-headphone" },
    { src: wmImg, class: "asset-washingmachine" },
    { src: tvImg, class: "asset-tv" }
  ];

  return (
    <div className="check-type-page">
      <div className="mesh-gradient"></div>
      <div className="mesh-overlay"></div>

      {assetList.map((asset, i) => (
        <img
          key={i}
          src={asset.src}
          alt=""
          className={`floating-asset ${asset.class}`}
          ref={(el) => (assetRefs.current[i] = el)}
        />
      ))}

      <div className="check-type-container">
        <header className="check-type-header">
          <h1 className="check-type-title">Select Category</h1>
          <p className="check-type-subtitle">
            Choose a product category to begin your analysis
          </p>
        </header>

        <div className="category-grid">
          {categories.map((cat, index) => (
            <button
              key={cat.key}
              className="category-square-btn"
              style={{ "--order": index }}
              onClick={() =>
                navigate("/brand", { state: { category: cat.key } })
              }
            >
              <img
                src={cat.img}
                alt=""
                className={`hover-product-img
                  ${cat.key === "laptop" ? "laptop-hover" : ""}
                  ${cat.key === "tablet" ? "tablet-hover" : ""}
                  ${cat.key === "tv" ? "tv-hover" : ""}
                  ${cat.key === "washing_machine" ? "washing-hover" : ""}
                  ${cat.key === "smartwatch" ? "watch-hover" : ""}
                  ${cat.key === "earphones" ? "headphone-hover" : ""}
                `}
              />
              <span className="category-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CheckType;