import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./WatchSecondHand.css";
import watchMockup from "../assets/brands/watch-mockup.png";
import appleLogo from "../assets/brands/apple.png";
import samsungLogo from "../assets/brands/samsung.png";
import garminLogo from "../assets/brands/garmin.png";
import noiseLogo from "../assets/brands/noise.png";
import boatLogo from "../assets/brands/boat.png";
import firebolttLogo from "../assets/brands/firebolt.png";
import fossilLogo from "../assets/brands/fossil.png";
import amazfitLogo from "../assets/brands/amazfit.png";

const WatchSecondHand = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedCategory = location.state?.category || "Device";
  const selectedBrand = location.state?.brand || "Brand";

  // Watch brand logo mapping (lowercase keys)
  const brandLogos = {
    apple: appleLogo,
    samsung: samsungLogo,
    garmin: garminLogo,
    noise: noiseLogo,
    boat: boatLogo,
    fireboltt: firebolttLogo,
    fossil: fossilLogo,
    amazfit: amazfitLogo,
  };

  const brandKey = selectedBrand?.toLowerCase().replace(/\s+/g, "").trim();
  const bootLogo = brandLogos[brandKey] || null;

  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    condition: "",
    usage: "",
  });

  const [sellerItems, setSellerItems] = useState([]);
  const [hasUploadedImage, setHasUploadedImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [watchStage, setWatchStage] = useState("idle");
  const [timeString, setTimeString] = useState("");
  const [dateString, setDateString] = useState("");
  const [clockHands, setClockHands] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [firstCheckboxClicked, setFirstCheckboxClicked] = useState(false);

 const sellerOptions = [
    "Original Purchase Bill",
    "Warranty Card",
    "Seller ID Proof",
    "Service Records",
    "Original Box",
    "Original Charger",
    "Extra Watch Strap",
  ];

useEffect(() => {
  if (hasUploadedImage) {
    setWatchStage("boot");

    const timeoutId = setTimeout(() => {
      setWatchStage("lockscreen");
    }, 2500);

    return () => clearTimeout(timeoutId);
  }
}, [hasUploadedImage]);


useEffect(() => {
  if (watchStage !== "lockscreen") return;

  const updateClock = () => {
    const now = new Date();

    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    const hourAngle = (h % 12) * 30 + m * 0.5;
    const minuteAngle = m * 6;
    const secondAngle = s * 6;

    // Format date
    const today = now.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

    setClockHands({
      hours: hourAngle,
      minutes: minuteAngle,
      seconds: secondAngle,
    });

    setDateString(today);
  };

  updateClock();
  const iv = setInterval(updateClock, 1000);

  return () => clearInterval(iv);
}, [watchStage]);

 const handleFileUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setImageFile(file);

  const reader = new FileReader();

  reader.onloadend = () => {
    setImagePreview(reader.result);
    setHasUploadedImage(true);
  };

  reader.readAsDataURL(file);
};
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSellerCheck = (item) => {
    const isFirst = !firstCheckboxClicked;
    const updated = sellerItems.includes(item)
      ? sellerItems.filter((i) => i !== item)
      : [...sellerItems, item];

    if (isFirst) setFirstCheckboxClicked(true);
    setSellerItems(updated);

    const allFieldsFilled =
      formData.productName.trim() &&
      formData.price.trim() &&
      formData.condition.trim() &&
      formData.usage.trim();

    if (isFirst && watchStage === "lockscreen" && allFieldsFilled) {
      setWatchStage("summary");
    }
  };

  const handleAnalyzeClick = () => {
  if (!hasUploadedImage) {
    alert("Please upload an image.");
    return;
  }

  const conditionMap = {
    "Like New": 4,
    Good: 3,
    Average: 2,
    Poor: 1,
  };

  const usageMap = {
    "Under 6 Months": 6,
    "1-2 Years": 18,
    "2+ Years": 36,
  };

  const asking = Number(formData.price) || 0;
  const productAgeMonths = usageMap[formData.usage] || 0;

  const currentYear = new Date().getFullYear();
  const modelYear = currentYear - Math.floor(productAgeMonths / 12);

  const estimatedOriginalPrice = asking
    ? Math.round(asking * 1.8)
    : 25000;

 navigate("/analysis", {
  state: {
    formInputs: {
      askingPrice: asking,
      brand: selectedBrand,
      category: "Smartwatch",
      model: formData.productName || "StandardWatch",
      model_year: modelYear,
      ram_gb: 0,
      storage_gb: 0,
      original_price_inr: estimatedOriginalPrice,
      rating: 4.3,
      product_age_months: productAgeMonths,
      product_condition: conditionMap[formData.condition] || 0,
      warranty_available: sellerItems.includes("Warranty Card") ? 1 : 0,
      documents_provided: sellerItems.includes("Original Purchase Bill") ? 1 : 0,
      seller_id_proof: sellerItems.includes("Seller ID Proof") ? 1 : 0,
      original_box: sellerItems.includes("Original Box") ? 1 : 0,
     accessories_available:
        sellerItems.includes("Original Charger") ||
        sellerItems.includes("Extra Watch Strap")
          ? 1
          : 0,
      seller_rating: 0,
    },
      imagePreview: imagePreview,
imageFile: imageFile,
  },
});
  };

  const BootScreen = () => (
    <div className="watch-boot">
      {bootLogo ? (
        <img
          src={bootLogo}
          alt={`${selectedBrand} logo`}
          style={{
            maxWidth: "45%",
            width: "45%",
            height: "auto",
            objectFit: "contain",
            objectPosition: "center",
            animation: "none",
          }}
        />
      ) : (
        <div className="watch-boot-inner">
          {selectedBrand ? selectedBrand : "Unknown Brand"}
        </div>
      )}
    </div>
  );

  const LockScreen = () => (
    <div className="watch-lockscreen">
      <div className="lock-content">
        {/* Analog Clock */}
        <div className="analog-clock">
          <div className="clock-face">
            {/* Hour markers */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="hour-marker"
                style={{
                  transform: `rotate(${i * 30}deg)`,
                }}
              />
            ))}

            {/* Hour hand */}
            <div
              className="hand hour-hand"
              style={{
                transform: `rotate(${clockHands.hours}deg)`,
              }}
            />

            {/* Minute hand */}
            <div
              className="hand minute-hand"
              style={{
                transform: `rotate(${clockHands.minutes}deg)`,
              }}
            />

            {/* Second hand */}
            <div
              className="hand second-hand"
              style={{
                transform: `rotate(${clockHands.seconds}deg)`,
              }}
            />

            {/* Center dot */}
            <div className="clock-center" />
          </div>
        </div>

        <div className="lock-date">{dateString}</div>
      </div>
    </div>
  );

  const SummaryScreen = () => (
    <div className="watch-summary">
      <div className="summary-content">
        <div className="summary-price">₹{formData.price}</div>
        <div className="summary-condition">Condition: {formData.condition}</div>
        <div className="summary-docs">Docs: {sellerItems.length}</div>
      </div>
    </div>
  );

  return (
    <div className="details-page watch-page">
      <div className="details-left">
        <h1 className="details-title">{selectedBrand} {selectedCategory}</h1>

        <form className="details-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group full-width">
            <label>Product Visuals</label>
            <input type="file" multiple accept="image/*" onChange={handleFileUpload} />
          </div>

          <div className="form-group">
            <label>Model Name</label>
            <input
              name="productName"
              placeholder="e.g. Apple Watch Series 9"
              onChange={handleChange}
              value={formData.productName}
            />
          </div>

          <div className="form-group">
            <label>Asking Price</label>
            <input
              type="number"
              name="price"
              placeholder="Amount"
              onChange={handleChange}
              value={formData.price}
            />
          </div>

          <div className="form-group">
            <label>Physical Condition</label>
            <select name="condition" onChange={handleChange} value={formData.condition}>
              <option value="">Select</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Average">Average</option>
              <option value="Poor">Poor</option>
            </select>
          </div>

          <div className="form-group">
            <label>Usage Period</label>
            <select name="usage" onChange={handleChange} value={formData.usage}>
              <option value="">Select</option>
              <option value="Under 6 Months">Under 6 Months</option>
              <option value="1-2 Years">1-2 Years</option>
              <option value="2+ Years">2+ Years</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label>Trust & Verification</label>
            <div className="seller-checkboxes">
              {sellerOptions.map((item) => (
                <div
                  key={item}
                  className={`selectable-item ${sellerItems.includes(item) ? "selected" : ""}`}
                  onClick={() => handleSellerCheck(item)}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <button
            className="analyze-btn"
            type="button"
            onClick={handleAnalyzeClick}
          >
            Analyze Deal Potential
          </button>
        </form>
      </div>

      <div className="details-right">
        <div className="watch-preview">
          <div className="watch-screen">
            {watchStage === "idle" && <div className="watch-idle" />}
            {watchStage === "boot" && <BootScreen />}
            {watchStage === "lockscreen" && <LockScreen />}
            {watchStage === "summary" && <SummaryScreen />}
          </div>
          <img src={watchMockup} alt="Watch Frame" className="watch-frame" />
        </div>
      </div>
    </div>
  );
};

export default WatchSecondHand;
