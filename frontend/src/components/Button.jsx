import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  type = 'button',
  disabled = false,
  fullWidth = false 
}) => {
  return (
    <button
      className={`btn btn-${variant} ${fullWidth ? 'btn-full-width' : ''}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;



