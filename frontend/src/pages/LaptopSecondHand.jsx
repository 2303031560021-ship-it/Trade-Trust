import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./LaptopSecondHand.css";
import laptopMockup from "../assets/brands/laptop-mockup.png";
import asusLogo from "../assets/brands/asus.png";
import hpLogo from "../assets/brands/hp.png";
import dellLogo from "../assets/brands/dell.png";
import lenovoLogo from "../assets/brands/lenovo.png";
import appleLogo from "../assets/brands/apple.png";
import msiLogo from "../assets/brands/msi.png";
import microsoftLogo from "../assets/brands/microsoft.png";
import acerLogo from "../assets/brands/acer.png";

const LaptopSecondHand = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedCategory = location.state?.category || "Device";
  const selectedBrand = location.state?.brand || "Brand";

  // Laptop brand logo mapping (lowercase keys)
  const brandLogos = {
    asus: asusLogo,
    hp: hpLogo,
    dell: dellLogo,
    lenovo: lenovoLogo,
    apple: appleLogo,
    msi: msiLogo,
    microsoft: microsoftLogo,
    acer: acerLogo,
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
  const [imagePreview, setImagePreview] = useState(null);
  const [bootFinished, setBootFinished] = useState(false);
  const [laptopStage, setLaptopStage] = useState("idle");
  const [timeString, setTimeString] = useState("");
  const [dateString, setDateString] = useState("");
  const [firstCheckboxClicked, setFirstCheckboxClicked] = useState(false);

  const sellerOptions = [
    "Original Purchase Bill",
    "Warranty Card",
    "Seller ID Proof",
    "Service Records",
    "Original Box",
    "Laptop Charger",
    "Battery Health Report",
    "Original Accessories",
    "Bag/Sleeve",
  ];
  useEffect(() => {
    if (hasUploadedImage && !bootFinished) {
      setLaptopStage("boot");

      const t = setTimeout(() => {
        setLaptopStage("lockscreen");
        setBootFinished(true);
      }, 3500);

      return () => clearTimeout(t);
    }
  }, [hasUploadedImage, bootFinished]);

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

    if (isFirst && laptopStage === "lockscreen" && allFieldsFilled) {
      setLaptopStage("notes");
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
  const modelYear = productAgeMonths
    ? currentYear - Math.floor(productAgeMonths / 12)
    : currentYear;

  const estimatedOriginalPrice = asking
    ? Math.round(asking * 1.8)
    : 80000;

  navigate("/analysis", {
    state: {
      formInputs: {
        askingPrice: asking,
        brand: selectedBrand,
        category: "Laptop",
        model: formData.productName,
        model_year: modelYear,
        ram_gb: 8,
        storage_gb: 512,
        original_price_inr: estimatedOriginalPrice,
        rating: 4.4,
        product_age_months: productAgeMonths,
        product_condition: conditionMap[formData.condition] || 0,
        warranty_available: sellerItems.includes("Warranty Card") ? 1 : 0,
        documents_provided: sellerItems.includes("Original Purchase Bill") ? 1 : 0,
        seller_id_proof: sellerItems.includes("Seller ID Proof") ? 1 : 0,
        original_box: sellerItems.includes("Original Box") ? 1 : 0,
       accessories_available:
          sellerItems.includes("Laptop Charger") ||
          sellerItems.includes("Original Accessories")
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
  const BootScreen = () => (
    <div className="laptop-boot">
      {bootLogo ? (
        <img
          src={bootLogo}
          alt={`${selectedBrand} logo`}
          style={{
            maxWidth: "60%",
            width: "60%",
            height: "auto",
            objectFit: "contain",
            objectPosition: "center",
            animation: "laptopBootFade 3.5s ease-in-out forwards",
          }}
        />
      ) : (
        <div className="laptop-boot-inner">{selectedBrand ? selectedBrand : "Unknown Brand"}</div>
      )}
    </div>
  );

  const LockScreen = () => (
    <div className="laptop-lockscreen">
      <div className="lock-content">
        <div className="lock-time">{timeString}</div>
        <div className="lock-date">{dateString}</div>
        <div className="lock-status">System Ready</div>
      </div>
    </div>
  );

  const NotesScreen = () => (
    <div className="laptop-notes">
      <div className="notes-card">
        <h3>Deal Summary</h3>
        <div className="notes-list">
          {hasUploadedImage && (
            <div className="notes-row">
              <span>Images:</span>
              <span>Uploaded</span>
            </div>
          )}
          <div className="notes-row">
            <span>Model:</span>
            <span>{formData.productName}</span>
          </div>
          <div className="notes-row">
            <span>Price:</span>
            <span>₹{formData.price}</span>
          </div>
          <div className="notes-row">
            <span>Condition:</span>
            <span>{formData.condition}</span>
          </div>
          {formData.usage && (
            <div className="notes-row">
              <span>Usage:</span>
              <span>{formData.usage}</span>
            </div>
          )}
          {sellerItems.length > 0 && (
            <div className="notes-row">
              <span>Documents:</span>
              <span>{sellerItems.length} provided</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="details-page laptop-page">
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
              placeholder="e.g. MacBook Pro"
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
        <div className="laptop-preview">
          <div className="laptop-screen">
            {laptopStage === "idle" && <div className="laptop-idle" />}
            {laptopStage === "boot" && <BootScreen />}
            {laptopStage === "lockscreen" && <LockScreen />}
            {laptopStage === "notes" && <NotesScreen />}
          </div>
          <img src={laptopMockup} alt="Laptop Frame" className="laptop-frame" />
        </div>
      </div>
    </div>
  );
};

export default LaptopSecondHand;
