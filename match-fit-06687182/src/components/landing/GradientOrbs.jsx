export function GradientOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Large primary orb */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full animate-pulse-slow"
        style={{
          background: "radial-gradient(circle, rgba(17, 143, 243, 0.15) 0%, transparent 70%)",
          top: "-10%",
          right: "-10%",
          filter: "blur(60px)",
        }}
      />
      {/* Secondary orb */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full animate-float-slow"
        style={{
          background: "radial-gradient(circle, rgba(12, 87, 152, 0.12) 0%, transparent 70%)",
          bottom: "10%",
          left: "-5%",
          filter: "blur(40px)",
        }}
      />
      {/* Accent orb */}
      <div
        className="absolute w-[300px] h-[300px] rounded-full animate-pulse-slow"
        style={{
          background: "radial-gradient(circle, rgba(231, 243, 254, 0.3) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          filter: "blur(50px)",
          animationDelay: "2s",
        }}
      />
    </div>
  )
}
