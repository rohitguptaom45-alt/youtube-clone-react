import React, { useState } from 'react';
import '../styles/Chips.css';

const chipData = [
  'All', 'Music', 'Mixes', 'Disha Vakani', 'Movie musicals',
  'Gaming', 'T-Series', 'Live', 'Indian pop music',
  'Arijit Singh', 'Ajay Devgn', 'Telenovelas',
  'Bhojpuri cinema', 'Thrillers'
];

function Chips({ onChipClick }) {
  const [activeChip, setActiveChip] = useState('All');

  const handleChipClick = (chip) => {
    setActiveChip(chip);
    onChipClick(chip);
  };

  return (
    <div className="chips-wrapper">
      <div className="chips">
        {chipData.map(chip => (
          <span
            key={chip}
            className={`chip ${activeChip === chip ? 'active' : ''}`}
            onClick={() => handleChipClick(chip)}
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

export default Chips;