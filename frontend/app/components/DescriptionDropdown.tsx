import styles from "../styles/DescriptionDropdown.module.css";
import { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";

const Tooltip = ({ description }: { description: string }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div className={styles.tooltipContainer}>
      <FaInfoCircle onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className={styles.infoIcon} />
      {isHovered && <div className={styles.tooltip}>{description}</div>}
    </div>
  );
};

export default Tooltip;
