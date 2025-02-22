import React, { useState, useEffect } from "react";
import "./Slider.css"; // Import styles

const images = [
  "https://media.istockphoto.com/id/505207430/photo/fresh-raw-beef-steak.jpg?s=612x612&w=0&k=20&c=QxOege3Io4h1TNJLtGYh71rxb29p1BfFcZvCipz4WVY=",
  "https://t4.ftcdn.net/jpg/03/59/86/55/360_F_359865519_H5OPBm9bqpu8UWvr2OGf6afr1O8TB0nJ.jpg",
  "https://media.gettyimages.com/id/694177316/photo/bbq-feast.jpg?s=612x612&w=gi&k=20&c=2tZM_ziHbQu1C0qTfbrO1kv4VI0NeSs403lCnEenuFI=",
  "https://media.istockphoto.com/id/1363601737/photo/grilled-top-sirloin-or-cup-rump-beef-meat-steak-on-marble-board-black-background-top-view.jpg?s=612x612&w=0&k=20&c=vlotfOfhfx8H8Hy9BEXaATETcoOWkha6o_6nA2BYT5M=",
];

const captions = [
  "Fresh Raw Beef Steak",
  "Premium Cut Ribeye",
  "BBQ Feast",
  "Grilled Sirloin Perfection",
];

const Slider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Auto change the image every 5 seconds
  useEffect(() => {
    const interval = setInterval(nextSlide, 1500); // Change slide every 5 seconds

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);

  return (
    <div className="sld-slider">
      <button className="sld-left-arrow" onClick={prevSlide}>❮</button>
      <div className="sld-slider-content">
        {images.map((img, index) => (
          <div
            key={index}
            className={`sld-slide ${index === currentIndex ? "sld-active" : ""}`}
            style={{ backgroundImage: `url(${img})` }}
          >
            {index === currentIndex && (
              <div className="sld-caption">{captions[index]}</div>
            )}
          </div>
        ))}
      </div>
      <button className="sld-right-arrow" onClick={nextSlide}>❯</button>
    </div>
  );
};

export default Slider;
