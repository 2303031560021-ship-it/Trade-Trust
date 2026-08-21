import './Card.css';

const Card = ({ children, onClick, className = '' }) => {
  return (
    <div className={`card ${onClick ? 'card-clickable' : ''} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;



