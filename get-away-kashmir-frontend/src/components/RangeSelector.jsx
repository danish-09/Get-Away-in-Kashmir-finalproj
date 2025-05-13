import React, { useState } from "react";

const options = [
  "Completely Disagree",
  "Slightly Disagree",
  "Neutral",
  "Slightly Agree",
  "Completely Agree",
];

const RangeSelector = ({ index, handleChange }) => {
  const [value, setValue] = useState(2);

  const handleSelect = (e) => {
    setValue(parseInt(e.target.value)); // Updated local UI state 
    handleChange(index, e.target.value); // parent answer state updated
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold text-center mb-4 text-gray-800">
        How much do you agree?
      </h2>

      {/* Slider */}
      <div className="relative w-full px-2">
        <input
          type="range"
          min="0"
          max="4"
          value={value}
          onChange={handleSelect}
          className="w-full h-3 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-700 rounded-full appearance-none outline-none transition-all
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:border
          [&::-webkit-slider-thumb]:border-gray-400
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:transition-all
          [&::-moz-range-thumb]:w-5
          [&::-moz-range-thumb]:h-5
          [&::-moz-range-thumb]:bg-white
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:border
          [&::-moz-range-thumb]:border-gray-400
          [&::-moz-range-thumb]:shadow-md"
        />
        {/* Labels */}
        <div className="flex justify-between mt-4 text-xs font-medium text-gray-600">
          {options.map((option, idx) => (
            <span
              key={idx}
              className={`w-1/5 text-center transition-colors duration-200 ${ //value will be same to idx since ist being updated in state contnuosly
                idx === value ? "text-[#d97706] font-semibold" : ""
              }`}
            >
              {option}
            </span>
          ))}
        </div>
      </div>

      {/* Selected Text */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-700">
          Selected:{" "}
          <span className="font-semibold text-[#d97706]">{options[value]}</span>
        </p>
      </div>
    </div>
  );
};

export default RangeSelector;
