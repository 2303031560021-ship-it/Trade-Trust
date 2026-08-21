import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SecondHand.css";
import phoneMockup from "../assets/brands/phone-mockup.png";
import appleLogo from "../assets/brands/apple.png";
import samsungLogo from "../assets/brands/samsung.png";
import oneplusLogo from "../assets/brands/oneplus.png";
import xiaomiLogo from "../assets/brands/xiaomi.png";
import realmeLogo from "../assets/brands/realme.png";
import vivoLogo from "../assets/brands/vivo.png";
import googlePixelLogo from "../assets/brands/googlepixel.png";
import oppoLogo from "../assets/brands/oppo.png";

const SecondHand = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedCategory = location.state?.category || "Device";
  const selectedBrand = location.state?.brand || "Brand";

  // Brand logo mapping (filenames are lowercase). Fallback to apple.
  const brandLogos = {
    apple: appleLogo,
    samsung: samsungLogo,
    oneplus: oneplusLogo,
    xiaomi: xiaomiLogo,
    realme: realmeLogo,
    vivo: vivoLogo,
    google: googlePixelLogo,
    pixel: googlePixelLogo,
    oppo: oppoLogo,
  };

  const normalizedBrand = selectedBrand?.toLowerCase().replace(/\s+/g, "");

  let bootLogo = brandLogos.apple; // default fallback

  if (normalizedBrand) {
    if (normalizedBrand.includes("apple")) bootLogo = brandLogos.apple;
    else if (normalizedBrand.includes("samsung")) bootLogo = brandLogos.samsung;
    else if (normalizedBrand.includes("oneplus")) bootLogo = brandLogos.oneplus;
    else if (normalizedBrand.includes("xiaomi")) bootLogo = brandLogos.xiaomi;
    else if (normalizedBrand.includes("realme")) bootLogo = brandLogos.realme;
    else if (normalizedBrand.includes("vivo")) bootLogo = brandLogos.vivo;
    else if (normalizedBrand.includes("google")) bootLogo = brandLogos.google;
    else if (normalizedBrand.includes("pixel")) bootLogo = brandLogos.pixel;
    else if (normalizedBrand.includes("oppo")) bootLogo = brandLogos.oppo;
  }

  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    condition: "",
    usage: ""
  });

  const [sellerItems, setSellerItems] = useState([]);
  const [phoneStage, setPhoneStage] = useState("idle");
  const [hasUploadedImage, setHasUploadedImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [bootFinished, setBootFinished] = useState(false);
  const [firstCheckboxClicked, setFirstCheckboxClicked] = useState(false);
  const [timeString, setTimeString] = useState("");
  const [dateString, setDateString] = useState("");

  const fieldLabels = {
    productName: "Model",
    price: "Price",
    condition: "Condition",
    usage: "Usage"
  };

  const sellerOptions = [
    "Original Purchase Bill", "Warranty Card", "Seller ID Proof",
    "Signed Sale Agreement (IMEI)", "Service Records",
    "Original Box", "Original Charger", "USB Cable", "Earphones"
  ];

  // Boot timer effect: 3.5 second auto-boot to lockscreen
  useEffect(() => {
    if (hasUploadedImage && !bootFinished) {
      console.log("🚀 BOOT STARTED - APPLE LOGO VISIBLE");
      setPhoneStage("boot");
      
      const bootTimer = setTimeout(() => {
        console.log("⏱️ BOOT COMPLETE - TRANSITIONING TO LOCKSCREEN");
        setPhoneStage("lockscreen");
        setBootFinished(true);
      }, 3500);
      
      return () => clearTimeout(bootTimer);
    }
  }, [hasUploadedImage, bootFinished]);

  // Update clock on lockscreen (minute-based to prevent blinking)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const dateStr = now.toLocaleDateString("en-US", { 
        weekday: "short", 
        month: "short", 
        day: "numeric" 
      });
      setTimeString(`${hours}:${minutes}`);
      setDateString(dateStr);
    };
    
    // Call immediately on mount
    updateClock();
    
    // Then update only on minute change
    const timer = setInterval(updateClock, 60000);
    return () => clearInterval(timer);
  }, []);

  // Unlock is handled on checkbox click only (see handleSellerCheck)
  // This avoids unlocking when fields are filled later while user previously
  // clicked a checkbox. Keeps behavior deterministic: unlock happens only
  // when user initiates it via clicking a seller checkbox.

const handleFileUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

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

  const handleFieldComplete = (e) => {
    const { name, value } = e.target;
    // This can be used for other purposes if needed
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
  const modelYear = productAgeMonths
    ? currentYear - Math.floor(productAgeMonths / 12)
    : currentYear;

  // --------------------------------------------
  // Brand-based original price estimation
  // This replaces the old askingPrice * 1.8 logic
  // --------------------------------------------

  const brandBasePrices = {
    Apple: 90000,
    Samsung: 70000,
    Google: 65000,
    OnePlus: 55000,
    Xiaomi: 30000,
    Realme: 25000,
    Vivo: 28000,
    Oppo: 27000
  };

  const estimatedOriginalPrice =
    brandBasePrices[selectedBrand] || 40000;

  navigate("/analysis", {
    state: {
      formInputs: {
        askingPrice: asking,
        brand: selectedBrand,
        category: "Mobile",
        model: formData.productName,
        model_year: modelYear,
        ram_gb: 6,
        storage_gb: 128,
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
          sellerItems.includes("USB Cable")
            ? 1
            : 0,
        seller_rating: 0,
      },
      imagePreview: imagePreview,
      imageFile:
        document.querySelector('input[type="file"]')?.files?.[0] || null,
    },
  });
};

  const handleSellerCheck = (item) => {
    const isFirstClick = !firstCheckboxClicked;

    // compute next selection state synchronously
    const updated = sellerItems.includes(item)
      ? sellerItems.filter((i) => i !== item)
      : [...sellerItems, item];

    // mark that user has interacted with checkboxes
    if (isFirstClick) setFirstCheckboxClicked(true);

    setSellerItems(updated);

    // Unlock should only occur when user clicks the checkbox (intentional action)
    // and only if all required fields are already filled and we're on lockscreen.
    const allFieldsFilled =
      formData.productName.trim() &&
      formData.price.trim() &&
      formData.condition.trim() &&
      formData.usage.trim();

    if (isFirstClick && phoneStage === "lockscreen" && allFieldsFilled) {
      console.log("🔓 UNLOCK (checkbox click) - MOVING TO NOTES");
      setPhoneStage("notes");
    }
  };

  // Phone screen components
  const IdleScreen = () => (
    <div className="phone-idle"></div>
  );

  const BootScreen = () => (
    <div className="phone-boot">
      <img
        src={bootLogo}
        alt={selectedBrand || "Apple"}
        className={`boot-logo ${selectedBrand?.toLowerCase() === "samsung" ? "boot-logo--samsung" : ""}`}
      />
    </div>
  );

  const LockScreen = () => (
    <div className="phone-lockscreen">
      <div className="lockscreen-content">
        <div className="lockscreen-time">{timeString}</div>
        <div className="lockscreen-date">{dateString}</div>
        <div className="lockscreen-security">Awaiting Information</div>
      </div>
    </div>
  );

  const OverviewScreen = () => (
    <div className="phone-overview">
      <div className="overview-card">
        <div className="overview-row">
          <span className="overview-label">Model</span>
          <span className="overview-value">{formData.productName}</span>
        </div>
        <div className="overview-row">
          <span className="overview-label">Price</span>
          <span className="overview-value">₹{formData.price}</span>
        </div>
        <div className="overview-row">
          <span className="overview-label">Condition</span>
          <span className="overview-value">{formData.condition}</span>
        </div>
        {formData.usage && (
          <div className="overview-row">
            <span className="overview-label">Usage</span>
            <span className="overview-value">{formData.usage}</span>
          </div>
        )}
      </div>
    </div>
  );

  const NotesScreen = () => (
    <div className="phone-notes">
      <div className="notes-card">
        <h3 className="notes-title">Deal Summary</h3>
        <div className="notes-content">
          {hasUploadedImage && (
            <p className="notes-row">
              <span className="notes-key">Images:</span>
              <span className="notes-val">Uploaded</span>
            </p>
          )}
          <p className="notes-row">
            <span className="notes-key">Model:</span>
            <span className="notes-val">{formData.productName}</span>
          </p>
          <p className="notes-row">
            <span className="notes-key">Price:</span>
            <span className="notes-val">₹{formData.price}</span>
          </p>
          <p className="notes-row">
            <span className="notes-key">Condition:</span>
            <span className="notes-val">{formData.condition}</span>
          </p>
          {formData.usage && (
            <p className="notes-row">
              <span className="notes-key">Usage:</span>
              <span className="notes-val">{formData.usage}</span>
            </p>
          )}
          {sellerItems.length > 0 && (
            <p className="notes-row">
              <span className="notes-key">Documents:</span>
              <span className="notes-val">{sellerItems.length} provided</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="details-page">
      <div className="details-left">
        <h1 className="details-title">
          {selectedBrand} {selectedCategory}
        </h1>

        <form className="details-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group full-width">
            <label>Product Visuals</label>
            <input type="file" multiple accept="image/*" onChange={handleFileUpload} />
          </div>

          <div className="form-group">
            <label>Model Name</label>
            <input
              name="productName"
              placeholder="e.g. iPhone 15 Pro"
              onChange={handleChange}
              onBlur={handleFieldComplete}
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
              onBlur={handleFieldComplete}
              value={formData.price}
            />
          </div>

          <div className="form-group">
            <label>Physical Condition</label>
            <select
              name="condition"
              onChange={handleChange}
              onBlur={handleFieldComplete}
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
              onBlur={handleFieldComplete}
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
        <div className="phone-preview">
          <div className="phone-screen">
            {phoneStage === "idle" && <IdleScreen />}
            {phoneStage === "boot" && <BootScreen />}
            {(phoneStage === "lockscreen" || phoneStage === "notes") && (
              <div className="phone-layer-wrapper">
                <div className={`lock-layer ${phoneStage === "notes" ? "slide-up" : ""}`}>
                  <LockScreen />
                </div>
                {phoneStage === "notes" && (
                  <div className="notes-layer">
                    <NotesScreen />
                  </div>
                )}
              </div>
            )}
            {phoneStage === "overview" && <OverviewScreen />}
          </div>
          <img src={phoneMockup} alt="Phone Frame" />
        </div>
      </div>
    </div>
  );
};

export default SecondHand;