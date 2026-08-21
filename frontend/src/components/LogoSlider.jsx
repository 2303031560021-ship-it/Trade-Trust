const LogoSlider = ({
  logos,
  direction = "left",
  pauseOnHover = true,
}) => {
  return (
    <div
      className="logo-slider"
      data-direction={direction}
      data-pause={pauseOnHover}
    >
      <div className="logo-slider-track">
        {/* Duplicate logos 4x for perfect infinite loop */}
        {[...Array(4)].flatMap((_, i) =>
          logos.map((logo, index) => (
            <div
              className="logo-slider-item"
              data-tooltip={logo.tooltip}  // ✅ TOOLTIP ON CIRCLE
              key={`${i}-${index}`}
            >
              <img src={logo.src} alt={logo.alt} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogoSlider;
