export function SoccerFieldBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.03] pointer-events-none">
      <svg viewBox="0 0 1200 800" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        {/* Field outline */}
        <rect x="50" y="50" width="1100" height="700" fill="none" stroke="#118ff3" strokeWidth="3" />
        {/* Center line */}
        <line x1="600" y1="50" x2="600" y2="750" stroke="#118ff3" strokeWidth="3" />
        {/* Center circle */}
        <circle cx="600" cy="400" r="100" fill="none" stroke="#118ff3" strokeWidth="3" />
        <circle cx="600" cy="400" r="5" fill="#118ff3" />
        {/* Left penalty box */}
        <rect x="50" y="225" width="150" height="350" fill="none" stroke="#118ff3" strokeWidth="3" />
        <rect x="50" y="300" width="60" height="200" fill="none" stroke="#118ff3" strokeWidth="3" />
        <circle cx="150" cy="400" r="5" fill="#118ff3" />
        {/* Right penalty box */}
        <rect x="1000" y="225" width="150" height="350" fill="none" stroke="#118ff3" strokeWidth="3" />
        <rect x="1090" y="300" width="60" height="200" fill="none" stroke="#118ff3" strokeWidth="3" />
        <circle cx="1050" cy="400" r="5" fill="#118ff3" />
        {/* Corner arcs */}
        <path d="M 50 70 Q 70 50 90 50" fill="none" stroke="#118ff3" strokeWidth="3" />
        <path d="M 1110 50 Q 1150 50 1150 90" fill="none" stroke="#118ff3" strokeWidth="3" />
        <path d="M 50 730 Q 50 750 70 750" fill="none" stroke="#118ff3" strokeWidth="3" />
        <path d="M 1150 710 Q 1150 750 1110 750" fill="none" stroke="#118ff3" strokeWidth="3" />
      </svg>
    </div>
  )
}
