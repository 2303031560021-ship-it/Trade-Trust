import LogoSlider from "./LogoSlider";
import "./LogoSliderSection.css";

// 🔥 ICONS
import botPng from "../assets/icons/bot.png";
import circleCheckBigPng from "../assets/icons/circle-check-big.png";
import clipboardPenPng from "../assets/icons/clipboard-pen.png";
import handshakePng from "../assets/icons/handshake.png";
import receiptRupeePng from "../assets/icons/receipt-indian-rupee.png";
import shieldUserPng from "../assets/icons/shield-user.png";
import sirenPng from "../assets/icons/siren.png";

const LogoSliderSection = () => {
  const logos = [
    { src: botPng, alt: "AI Bot", tooltip: "AI Analysis" },
    { src: circleCheckBigPng, alt: "Condition Verified", tooltip: "Condition OK" },
    { src: clipboardPenPng, alt: "Document Check", tooltip: "Docs Verified" },
    { src: handshakePng, alt: "Deal Handshake", tooltip: "Safe Deal" },
    { src: receiptRupeePng, alt: "Price Receipt", tooltip: "Fair Price" },
    { src: shieldUserPng, alt: "Seller Shield", tooltip: "Trusted Seller" },
    { src: sirenPng, alt: "Risk Alert", tooltip: "Risk Alert" },
  ];

  return (
    <section className="logo-slider-section">
      <LogoSlider
        logos={logos}
        direction="right"
        pauseOnHover={true}
      />
    </section>
  );
};

export default LogoSliderSection;
