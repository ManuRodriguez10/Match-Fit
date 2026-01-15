import { Calendar, Users, Trophy, Target, Timer, Award } from "lucide-react"

export function FloatingElements() {
  const elements = [
    { Icon: Calendar, delay: "0s", x: "10%", y: "20%" },
    { Icon: Users, delay: "2s", x: "85%", y: "15%" },
    { Icon: Trophy, delay: "4s", x: "75%", y: "70%" },
    { Icon: Target, delay: "1s", x: "15%", y: "75%" },
    { Icon: Timer, delay: "3s", x: "90%", y: "45%" },
    { Icon: Award, delay: "5s", x: "5%", y: "50%" },
  ]

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {elements.map((element, index) => (
        <div
          key={index}
          className="absolute animate-float"
          style={{
            left: element.x,
            top: element.y,
            animationDelay: element.delay,
            animationDuration: "6s",
          }}
        >
          <div className="p-3 rounded-2xl bg-[#118ff3]/10 backdrop-blur-sm border border-[#118ff3]/20">
            <element.Icon className="w-6 h-6 text-[#118ff3]/40" />
          </div>
        </div>
      ))}
    </div>
  )
}
