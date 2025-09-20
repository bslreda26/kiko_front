import React from "react";
import logoImage from "../assets/logo.jpg";

interface LogoSpinnerProps {
  size?: number;
  text?: string;
}

const LogoSpinner: React.FC<LogoSpinnerProps> = ({
  size = 50,
  text = "Loading...",
}) => {
  return (
    <div className="logo-spinner-container">
      <div
        className="logo-spinner"
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        <img
          src={logoImage}
          alt="Kiko Plume Logo"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      </div>
      {text && (
        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            marginTop: "1rem",
            fontSize: "0.9rem",
          }}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default LogoSpinner;
