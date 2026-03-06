import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// SVG path data for "Simply Nuts" logo text
const LOGO_PATHS = {
  // Stylized "S" shape
  S: 'M30,25 C30,15 40,10 50,10 C60,10 70,15 70,25 C70,35 40,35 40,45 C40,55 50,60 60,60 C70,60 75,55 75,50',
  // "imply" as connected script
  imply: 'M85,20 L85,60 M95,30 C95,25 105,25 105,35 L105,60 M115,30 C115,25 130,20 130,35 L130,60 M115,35 L130,35 M140,10 L140,60 M140,30 C140,25 155,25 155,35 L155,55 C155,70 140,70 135,65',
  // Nut shape
  nut1: 'M200,25 C200,15 210,8 220,8 C230,8 240,15 240,25 C240,35 230,42 220,42 C210,42 200,35 200,25 Z M210,25 C212,20 228,20 230,25 C228,30 212,30 210,25',
  // Second nut
  nut2: 'M250,30 C250,22 258,16 266,16 C274,16 282,22 282,30 C282,38 274,44 266,44 C258,44 250,38 250,30 Z M258,30 C260,26 272,26 274,30 C272,34 260,34 258,30',
}

// The main text paths that get "engraved"
const ENGRAVE_PATHS = [
  // S
  { d: 'M60,55 C60,35 90,30 90,30 C90,30 55,25 60,55 Z M55,60 C55,40 85,35 90,30 C95,25 60,20 55,45', delay: 0 },
  // i
  { d: 'M105,35 L105,65 M105,25 L105,28', delay: 0.3 },
  // m
  { d: 'M115,65 L115,40 C115,35 125,35 125,40 L125,65 M125,40 C125,35 135,35 135,40 L135,65', delay: 0.5 },
  // p
  { d: 'M145,40 L145,80 M145,40 C145,35 160,35 160,45 C160,55 145,55 145,50', delay: 0.8 },
  // l
  { d: 'M170,20 L170,65', delay: 1.0 },
  // y
  { d: 'M180,40 L190,55 M200,40 L185,70 C183,75 178,78 175,75', delay: 1.1 },
]

const ENGRAVE_PATHS_2 = [
  // N
  { d: 'M80,100 L80,140 L120,100 L120,140', delay: 0 },
  // u
  { d: 'M135,110 L135,130 C135,140 150,140 150,130 L150,110', delay: 0.3 },
  // t
  { d: 'M160,100 L160,135 C160,140 170,140 170,138 M155,110 L175,110', delay: 0.5 },
  // s
  { d: 'M185,112 C185,108 195,105 200,110 C205,115 185,120 185,128 C185,135 200,138 205,132', delay: 0.7 },
]

// Decorative nut outlines
const NUT_DECORATIONS = [
  { cx: 45, cy: 120, rx: 18, ry: 22, delay: 2.2 },
  { cx: 235, cy: 75, rx: 15, ry: 20, delay: 2.5 },
  { cx: 230, cy: 125, rx: 12, ry: 16, delay: 2.8 },
]

interface Spark {
  id: number
  x: number
  y: number
}

export default function LaserEngraveHero() {
  const [phase, setPhase] = useState<'waiting' | 'engraving' | 'done'>('waiting')
  const [laserPos, setLaserPos] = useState({ x: 60, y: 55 })
  const [sparks, setSparks] = useState<Spark[]>([])
  const [smokeParticles, setSmokeParticles] = useState<{ id: number; x: number; y: number }[]>([])
  const sparkId = useRef(0)
  const animFrame = useRef<number>()
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setPhase('engraving'), 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (phase !== 'engraving') return

    const totalDuration = 4000
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / totalDuration, 1)

      // Move laser along a path
      const angle = progress * Math.PI * 6
      const baseX = 60 + progress * 160
      const baseY = 80 + Math.sin(angle) * 40
      setLaserPos({ x: baseX, y: baseY })

      // Spawn sparks
      if (Math.random() > 0.3) {
        const id = sparkId.current++
        const spark = {
          id,
          x: baseX + (Math.random() - 0.5) * 10,
          y: baseY + (Math.random() - 0.5) * 10,
        }
        setSparks((prev) => [...prev.slice(-8), spark])

        // Smoke
        if (Math.random() > 0.6) {
          setSmokeParticles((prev) => [
            ...prev.slice(-5),
            { id, x: baseX + (Math.random() - 0.5) * 6, y: baseY },
          ])
        }
      }

      if (progress < 1) {
        animFrame.current = requestAnimationFrame(animate)
      } else {
        setPhase('done')
        setSparks([])
        setSmokeParticles([])
      }
    }

    animFrame.current = requestAnimationFrame(animate)
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current)
    }
  }, [phase])

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Wood surface */}
      <div className="wood-texture rounded-2xl shadow-2xl overflow-hidden border-4 border-wood-700/30">
        <div className="relative aspect-[16/9] flex items-center justify-center">
          {/* Wood grain overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                repeating-linear-gradient(85deg, transparent, transparent 40px, rgba(100,60,20,0.15) 40px, rgba(100,60,20,0.15) 41px),
                repeating-linear-gradient(88deg, transparent, transparent 80px, rgba(80,50,15,0.1) 80px, rgba(80,50,15,0.1) 82px),
                repeating-linear-gradient(92deg, transparent, transparent 120px, rgba(120,70,25,0.08) 120px, rgba(120,70,25,0.08) 121px)
              `,
            }}
          />

          {/* SVG Engraving Area */}
          <svg
            ref={svgRef}
            viewBox="0 0 280 160"
            className="w-full h-full relative z-10"
            style={{ maxWidth: '100%' }}
          >
            {/* Engraved text - "Simply" */}
            {ENGRAVE_PATHS.map((path, i) => (
              <motion.path
                key={`s-${i}`}
                d={path.d}
                fill="none"
                stroke="#5a3010"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  phase === 'engraving' || phase === 'done'
                    ? { pathLength: 1, opacity: 1 }
                    : {}
                }
                transition={{
                  pathLength: { duration: 1.2, delay: path.delay, ease: 'easeInOut' },
                  opacity: { duration: 0.1, delay: path.delay },
                }}
                style={{
                  filter: phase === 'done' ? 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' : 'none',
                }}
              />
            ))}

            {/* Engraved text - "Nuts" */}
            {ENGRAVE_PATHS_2.map((path, i) => (
              <motion.path
                key={`n-${i}`}
                d={path.d}
                fill="none"
                stroke="#5a3010"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  phase === 'engraving' || phase === 'done'
                    ? { pathLength: 1, opacity: 1 }
                    : {}
                }
                transition={{
                  pathLength: { duration: 1, delay: 1.4 + path.delay, ease: 'easeInOut' },
                  opacity: { duration: 0.1, delay: 1.4 + path.delay },
                }}
                style={{
                  filter: phase === 'done' ? 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' : 'none',
                }}
              />
            ))}

            {/* Decorative nut outlines */}
            {NUT_DECORATIONS.map((nut, i) => (
              <motion.ellipse
                key={`nut-${i}`}
                cx={nut.cx}
                cy={nut.cy}
                rx={nut.rx}
                ry={nut.ry}
                fill="none"
                stroke="#5a3010"
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  phase === 'engraving' || phase === 'done'
                    ? { pathLength: 1, opacity: 0.7 }
                    : {}
                }
                transition={{
                  pathLength: { duration: 0.8, delay: nut.delay, ease: 'easeInOut' },
                  opacity: { duration: 0.2, delay: nut.delay },
                }}
              />
            ))}

            {/* Leaf decorations */}
            <motion.path
              d="M30,95 Q35,85 45,90 Q35,95 30,95 Z"
              fill="none"
              stroke="#5a3010"
              strokeWidth="1.2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={phase !== 'waiting' ? { pathLength: 1, opacity: 0.6 } : {}}
              transition={{ duration: 0.5, delay: 2.4 }}
            />
            <motion.path
              d="M250,105 Q245,95 235,100 Q245,105 250,105 Z"
              fill="none"
              stroke="#5a3010"
              strokeWidth="1.2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={phase !== 'waiting' ? { pathLength: 1, opacity: 0.6 } : {}}
              transition={{ duration: 0.5, delay: 2.7 }}
            />

            {/* Underline flourish */}
            <motion.path
              d="M70,148 Q140,142 210,148"
              fill="none"
              stroke="#5a3010"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={phase !== 'waiting' ? { pathLength: 1, opacity: 0.5 } : {}}
              transition={{ duration: 0.8, delay: 3.0 }}
            />

            {/* Laser head (machine arm coming from top) */}
            <AnimatePresence>
              {phase === 'engraving' && (
                <>
                  {/* Laser arm */}
                  <motion.line
                    x1={laserPos.x}
                    y1={0}
                    x2={laserPos.x}
                    y2={laserPos.y - 8}
                    stroke="#888"
                    strokeWidth="2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    exit={{ opacity: 0 }}
                  />

                  {/* Laser nozzle */}
                  <motion.rect
                    x={laserPos.x - 4}
                    y={laserPos.y - 12}
                    width={8}
                    height={8}
                    rx={1}
                    fill="#666"
                    stroke="#444"
                    strokeWidth="0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />

                  {/* Laser beam */}
                  <motion.line
                    x1={laserPos.x}
                    y1={laserPos.y - 4}
                    x2={laserPos.x}
                    y2={laserPos.y}
                    stroke="#ff4500"
                    strokeWidth="1.5"
                    className="laser-glow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />

                  {/* Laser point glow */}
                  <motion.circle
                    cx={laserPos.x}
                    cy={laserPos.y}
                    r={3}
                    fill="#ff6b00"
                    className="laser-glow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                  <motion.circle
                    cx={laserPos.x}
                    cy={laserPos.y}
                    r={1.5}
                    fill="#fff"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9 }}
                    exit={{ opacity: 0 }}
                  />
                </>
              )}
            </AnimatePresence>

            {/* Sparks */}
            {sparks.map((spark) => (
              <motion.circle
                key={spark.id}
                cx={spark.x}
                cy={spark.y}
                r={1}
                fill="#ffaa00"
                initial={{ opacity: 1, scale: 1 }}
                animate={{
                  opacity: 0,
                  scale: 0,
                  x: (Math.random() - 0.5) * 20,
                  y: -Math.random() * 15,
                }}
                transition={{ duration: 0.4 }}
              />
            ))}

            {/* Smoke */}
            {smokeParticles.map((p) => (
              <motion.circle
                key={`smoke-${p.id}`}
                cx={p.x}
                cy={p.y}
                r={4}
                fill="rgba(180,160,140,0.3)"
                initial={{ opacity: 0.4, scale: 1, y: 0 }}
                animate={{ opacity: 0, scale: 3, y: -30 }}
                transition={{ duration: 1.5 }}
              />
            ))}
          </svg>

          {/* "Engraving complete" badge */}
          <AnimatePresence>
            {phase === 'done' && (
              <motion.div
                className="absolute bottom-4 right-4 bg-wood-900/80 text-gold-400 px-3 py-1.5 rounded-full text-xs font-engrave backdrop-blur-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Laser Engraved
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
