import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./TabletSecondHand.css";
import tabletMockup from "../assets/brands/tablet-mockup.png";
import appleLogo from "../assets/brands/apple.png";
import samsungLogo from "../assets/brands/samsung.png";
import lenovoLogo from "../assets/brands/lenovo.png";
import xiaomiLogo from "../assets/brands/xiaomi.png";
import microsoftLogo from "../assets/brands/microsoft.png";
import realmeLogo from "../assets/brands/realme.png";
import huaweiLogo from "../assets/brands/huawei.png";
import nokiaLogo from "../assets/brands/nokia.png";

const TabletSecondHand = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedCategory = location.state?.category || "tablet";
  const selectedBrand = location.state?.brand || "Apple";

  const brandLogos = {
    apple: appleLogo,
    samsung: samsungLogo,
    lenovo: lenovoLogo,
    xiaomi: xiaomiLogo,
    mi: xiaomiLogo,
    microsoft: microsoftLogo,
    realme: realmeLogo,
    huawei: huaweiLogo,
    nokia: nokiaLogo,
  };

  const brandKey = selectedBrand?.toLowerCase().replace(/\s+/g, "").trim();
  const bootLogo = brandLogos[brandKey] || null;

  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    condition: "",
    usage: "",
  });

  const [sellerItems, setSellerItems] = useState([]);
  const [hasUploadedImage, setHasUploadedImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [bootFinished, setBootFinished] = useState(false);
  const [tabletStage, setTabletStage] = useState("idle");
  const [timeString, setTimeString] = useState("");
  const [dateString, setDateString] = useState("");
  const [firstCheckboxClicked, setFirstCheckboxClicked] = useState(false);

  const sellerOptions = [
    "Original Purchase Bill",
    "Warranty Card",
    "Seller ID Proof",
    "Service Records",
    "Original Box",
    "Original Charger",
    "Original Keyboard/Cover",
    "Stylus/Pen",
    "Screen Guard",
  ];

  // ======================
  // BOOT → LOCKSCREEN
  // ======================
  useEffect(() => {
    if (hasUploadedImage && !bootFinished) {
      setTabletStage("boot");

      const t = setTimeout(() => {
        setTabletStage("lockscreen");
        setBootFinished(true);
      }, 3500);

      return () => clearTimeout(t);
    }
  }, [hasUploadedImage, bootFinished]);

  // ======================
  // CLOCK
  // ======================
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const dateStr = now.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      setTimeString(`${hours}:${minutes}`);
      setDateString(dateStr);
    };

    updateClock();
    const iv = setInterval(updateClock, 60000);
    return () => clearInterval(iv);
  }, []);

  // ======================
  // FILE UPLOAD
  // ======================
const handleFileUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setImageFile(file);   // ⭐ ADD THIS

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

    if (isFirst && tabletStage === "lockscreen" && allFieldsFilled) {
      setTabletStage("summary");
    }
  };

  // ======================
  // ANALYZE CLICK
  // ======================
  const handleAnalyzeClick = () => {
    if (!imageFile) {
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
    const modelYear = productAgeMonths
      ? currentYear - Math.floor(productAgeMonths / 12)
      : currentYear;

    const estimatedOriginalPrice = asking
      ? Math.round(asking * 1.8)
      : 40000;

    navigate("/analysis", {
      state: {
        formInputs: {
          askingPrice: asking,
          brand: selectedBrand,
          category: "Tablet",
          model: formData.productName,
          model_year: modelYear,
          ram_gb: 4,
          storage_gb: 64,
          original_price_inr: estimatedOriginalPrice,
          rating: 4.2,
          product_age_months: productAgeMonths,
          product_condition: conditionMap[formData.condition] || 0,
          warranty_available: sellerItems.includes("Warranty Card") ? 1 : 0,
          documents_provided: sellerItems.includes("Original Purchase Bill") ? 1 : 0,
          seller_id_proof: sellerItems.includes("Seller ID Proof") ? 1 : 0,
          original_box: sellerItems.includes("Original Box") ? 1 : 0,
          accessories_available:
            sellerItems.includes("Original Charger") ||
            sellerItems.includes("Original Keyboard/Cover")
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
    <div className="tablet-boot">
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
            animation: "tabletBootFade 3.5s ease-in-out forwards",
          }}
        />
      ) : (
        <div className="tablet-boot-inner">
          {selectedBrand || "Unknown Brand"}
        </div>
      )}
    </div>
  );

  const LockScreen = () => (
    <div className="tablet-lockscreen">
      <div className="lock-content">
        <div className="lock-time">{timeString}</div>
        <div className="lock-date">{dateString}</div>
        <div className="lock-status">Verification Ready</div>
      </div>
    </div>
  );

  const SummaryScreen = () => (
    <div className="tablet-summary">
      <div className="summary-card">
        <h3>Deal Summary</h3>
        <div className="summary-list">
          {hasUploadedImage && (
            <div className="summary-row">
              <span>Images:</span>
              <span>Uploaded</span>
            </div>
          )}
          <div className="summary-row">
            <span>Model:</span>
            <span>{formData.productName}</span>
          </div>
          <div className="summary-row">
            <span>Price:</span>
            <span>₹{formData.price}</span>
          </div>
          <div className="summary-row">
            <span>Condition:</span>
            <span>{formData.condition}</span>
          </div>
          {formData.usage && (
            <div className="summary-row">
              <span>Usage:</span>
              <span>{formData.usage}</span>
            </div>
          )}
          {sellerItems.length > 0 && (
            <div className="summary-row">
              <span>Documents:</span>
              <span>{sellerItems.length} provided</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="details-page tablet-page">
      <div className="details-left">
        <h1 className="details-title">
          {selectedBrand} {selectedCategory}
        </h1>

        <form className="details-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group full-width">
            <label>Product Visuals</label>
            <input type="file" accept="image/*" onChange={handleFileUpload} />
          </div>

          <div className="form-group">
            <label>Model Name</label>
            <input
              name="productName"
              placeholder="e.g. iPad Pro"
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
            <select
              name="condition"
              onChange={handleChange}
              value={formData.condition}
            >
              <option value="">Select</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Average">Average</option>
              <option value="Poor">Poor</option>
            </select>
          </div>

          <div className="form-group">
            <label>Usage Period</label>
            <select
              name="usage"
              onChange={handleChange}
              value={formData.usage}
            >
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
                  className={`selectable-item ${
                    sellerItems.includes(item) ? "selected" : ""
                  }`}
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
        <div className="tablet-preview">
          <div className="tablet-screen">
            {tabletStage === "idle" && <div className="tablet-idle" />}
            {tabletStage === "boot" && <BootScreen />}
            {tabletStage === "lockscreen" && <LockScreen />}
            {tabletStage === "summary" && <SummaryScreen />}
          </div>
          <img
            src={tabletMockup}
            alt="Tablet Frame"
            className="tablet-frame"
          />
        </div>
      </div>
    </div>
  );
};

export default TabletSecondHand;