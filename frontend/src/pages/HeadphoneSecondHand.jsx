import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./HeadphoneSecondHand.css";
import headphoneMockup from "../assets/brands/headphone-mockup.png";

const HeadphoneSecondHand = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedCategory = location.state?.category || "Headphones";
  const selectedBrand = location.state?.brand || "Brand";

  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    condition: "",
    usage: "",
  });

  const [sellerItems, setSellerItems] = useState([]);
  const [hasUploadedImage, setHasUploadedImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

 const sellerOptions = [
    "Original Purchase Bill",
    "Warranty Card",
    "Seller ID Proof",
    "Service Records",
    "Original Box",
    "Original Charging Cable",
    "Carrying Pouch/Case",
    "Extra Ear Cushions",
  ];
  const allFieldsFilled =
    formData.productName.trim() &&
    formData.price.trim() &&
    formData.condition.trim() &&
    formData.usage.trim();

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
    const updated = sellerItems.includes(item)
      ? sellerItems.filter((i) => i !== item)
      : [...sellerItems, item];

    setSellerItems(updated);
  };

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
    const modelYear = currentYear - Math.floor(productAgeMonths / 12);

    const estimatedOriginalPrice = asking
      ? Math.round(asking * 1.7)
      : 5000;

    navigate("/analysis", {
      state: {
        formInputs: {
          askingPrice: asking,
          brand: selectedBrand,
          category: "Headphones",   // MUST match dataset
          model: formData.productName || "StandardHeadphone",
          model_year: modelYear,
          ram_gb: 0,
          storage_gb: 0,
          original_price_inr: estimatedOriginalPrice,
          rating: 4.2,
          product_age_months: productAgeMonths,
          product_condition: conditionMap[formData.condition] || 0,
          warranty_available: sellerItems.includes("Warranty Card") ? 1 : 0,
          documents_provided: sellerItems.includes("Original Purchase Bill") ? 1 : 0,
          seller_id_proof: sellerItems.includes("Seller ID Proof") ? 1 : 0,
          original_box: sellerItems.includes("Original Box") ? 1 : 0,
          accessories_available:
            sellerItems.includes("Original Charging Cable") ||
            sellerItems.includes("Carrying Pouch/Case")
              ? 1
              : 0,
          seller_rating: 0,
        },
       imagePreview: imagePreview,
imageFile: imageFile,
      },
    });
  };

  return (
    <div className="details-page headphone-page">
      <div className="details-left">
        <h1 className="details-title">
          {selectedBrand} {selectedCategory}
        </h1>

        <form className="details-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group full-width">
            <label>Product Visuals</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
            />
          </div>

          <div className="form-group">
            <label>Model Name</label>
            <input
              name="productName"
              placeholder="e.g. Sony WH-1000XM4"
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
        <div className="headphone-preview">
          <img
            src={headphoneMockup}
            alt="Headphone Frame"
            className="headphone-frame"
          />
        </div>
      </div>
    </div>
  );
};

export default HeadphoneSecondHand;