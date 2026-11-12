import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Building2, Cog, Play, Pause, RotateCcw, Maximize2, Info, CheckCircle2 } from 'lucide-react'
import { useMotion } from '../../config/MotionContext.jsx'

export default function Playground() {
  const { motionEnabled } = useMotion()
  const [mode, setMode] = useState('city') // 'city' or 'engine'
  const [loading, setLoading] = useState(false)
  const [selectedInfo, setSelectedInfo] = useState(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  // Three.js references stored in refs to allow clean disposal
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const animIdRef = useRef(null)
  const objectsRef = useRef([])

  // Switch mode with loading animation
  const switchMode = (newMode) => {
    if (newMode === mode) return
    setLoading(true)
    setSelectedInfo(null)
    setTimeout(() => {
      setMode(newMode)
      setLoading(false)
    }, 400)
  }

  // Initialize Three.js Scene based on mode
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || typeof window.THREE === 'undefined') return
    const THREE = window.THREE

    // Cleanup previous scene
    if (animIdRef.current) cancelAnimationFrame(animIdRef.current)
    if (rendererRef.current) {
      rendererRef.current.dispose()
      rendererRef.current = null
    }
    objectsRef.current = []

    const width = canvas.clientWidth || 600
    const height = canvas.clientHeight || 450

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x090909)
    scene.fog = new THREE.FogExp2(0x090909, 0.015)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(20, 30, 20)
    dirLight.castShadow = true
    scene.add(dirLight)

    const redLight = new THREE.PointLight(0xe32b3c, 3, 50)
    redLight.position.set(-15, 10, -15)
    scene.add(redLight)

    const blueLight = new THREE.PointLight(0x3b82f6, 2, 50)
    blueLight.position.set(15, 10, 15)
    scene.add(blueLight)

    // Raycaster for clicking objects
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    // ────────────────────────────────────────────────────────────────────────
    // MODE 1: DIGITAL CITY
    // ────────────────────────────────────────────────────────────────────────
    if (mode === 'city') {
      camera.position.set(25, 20, 25)
      camera.lookAt(0, 0, 0)

      // Base grid / ground
      const gridHelper = new THREE.GridHelper(60, 30, 0xe32b3c, 0x222222)
      gridHelper.position.y = -0.1
      scene.add(gridHelper)

      const groundGeo = new THREE.PlaneGeometry(60, 60)
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.9 })
      const ground = new THREE.Mesh(groundGeo, groundMat)
      ground.rotation.x = -Math.PI / 2
      ground.receiveShadow = true
      scene.add(ground)

      // City buildings data mapped to portfolio items
      const buildingData = [
        {
          id: 'about',
          name: 'About Me',
          category: 'Profile & Background',
          desc: 'Full-Stack Software Engineer specializing in scalable web architecture, clean code, and robust backend systems.',
          x: -8, z: -8, w: 4, h: 12, d: 4, color: 0xe32b3c
        },
        {
          id: 'skills',
          name: 'Core Skills',
          category: 'Tech Stack',
          desc: 'Expertise in React, Node.js, TypeScript, Python, MongoDB, SQL, and modern system design principles.',
          x: 0, z: -8, w: 5, h: 16, d: 5, color: 0x3b82f6
        },
        {
          id: 'rescuegrid',
          name: 'RescueGrid AI',
          category: 'Featured Project',
          desc: 'AI-driven disaster response and resource coordination platform built for high reliability and rapid allocation.',
          x: 8, z: -8, w: 4, h: 14, d: 4, color: 0xe32b3c
        },
        {
          id: 'studynotion',
          name: 'StudyNotion',
          category: 'EdTech Platform',
          desc: 'Interactive EdTech platform featuring course management, secure payment gateway, and dynamic video lectures.',
          x: -6, z: 4, w: 5, h: 15, d: 5, color: 0x10b981
        },
        {
          id: 'realestate',
          name: 'Real Estate Platform',
          category: 'Full-Stack App',
          desc: 'Modern property listing and management platform with advanced search filters, user authentication, and maps.',
          x: 6, z: 4, w: 5, h: 13, d: 5, color: 0xf59e0b
        }
      ]

      buildingData.forEach((data) => {
        const group = new THREE.Group()

        // Building tower
        const geom = new THREE.BoxGeometry(data.w, data.h, data.d)
        const mat = new THREE.MeshStandardMaterial({
          color: data.color,
          roughness: 0.3,
          metalness: 0.8,
          emissive: data.color,
          emissiveIntensity: 0.15
        })
        const mesh = new THREE.Mesh(geom, mat)
        mesh.position.y = data.h / 2
        mesh.castShadow = true
        mesh.receiveShadow = true
        group.add(mesh)

        // Architectural details (roof accent)
        const roofGeom = new THREE.BoxGeometry(data.w * 0.8, 0.5, data.d * 0.8)
        const roofMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
        const roof = new THREE.Mesh(roofGeom, roofMat)
        roof.position.y = data.h + 0.25
        group.add(roof)

        group.position.set(data.x, 0, data.z)
        group.userData = data
        scene.add(group)
        objectsRef.current.push(group)
      })

      // Traffic light particles (moving cars)
      const carGeo = new THREE.BoxGeometry(0.6, 0.4, 1.2)
      const carMat = new THREE.MeshBasicMaterial({ color: 0xe32b3c })
      const cars = []
      for (let i = 0; i < 8; i++) {
        const car = new THREE.Mesh(carGeo, carMat)
        car.position.set((Math.random() - 0.5) * 40, 0.2, (Math.random() - 0.5) * 40)
        scene.add(car)
        cars.push({ mesh: car, speed: (Math.random() * 0.1 + 0.05) })
      }

      // Animation loop for city
      let angle = 0
      const animateCity = () => {
        if (!rendererRef.current) return
        if (isPlaying && motionEnabled) {
          angle += 0.002 * speed
          camera.position.x = Math.cos(angle) * 32
          camera.position.z = Math.sin(angle) * 32
          camera.lookAt(0, 4, 0)

          cars.forEach(c => {
            c.mesh.position.z += c.speed * speed
            if (c.mesh.position.z > 25) c.mesh.position.z = -25
          })
        }
        renderer.render(scene, camera)
        animIdRef.current = requestAnimationFrame(animateCity)
      }
      animIdRef.current = requestAnimationFrame(animateCity)

    }
    // ────────────────────────────────────────────────────────────────────────
    // MODE 2: MECHANICAL ENGINE
    // ────────────────────────────────────────────────────────────────────────
    else {
      camera.position.set(15, 12, 18)
      camera.lookAt(0, 0, 0)

      // Engine components data
      const engineParts = [
        {
          id: 'crankshaft',
          name: 'Main Crankshaft',
          category: 'Power Transmission',
          desc: 'Converts reciprocating linear piston motion into rotational force with precision balance.',
          type: 'cylinder',
          pos: [0, -4, 0],
          size: [1.2, 8, 1.2],
          color: 0x94a3b8
        },
        {
          id: 'piston',
          name: 'Piston Assembly',
          category: 'Combustion Chamber',
          desc: 'Transfers force from expanding gas in the cylinder to the crankshaft via connecting rod.',
          type: 'box',
          pos: [0, 2, 0],
          size: [2.5, 3, 2.5],
          color: 0xe32b3c
        },
        {
          id: 'gear1',
          name: 'Primary Gear',
          category: 'Timing & Drive',
          desc: 'Interlocks with secondary gears to synchronize mechanical timing and torque delivery.',
          type: 'torus',
          pos: [-5, 0, 0],
          size: [3, 0.8, 16],
          color: 0x3b82f6
        },
        {
          id: 'gear2',
          name: 'Secondary Gear',
          category: 'Transmission',
          desc: 'Transfers rotational velocity across parallel axes with minimal friction loss.',
          type: 'torus',
          pos: [5, 0, 0],
          size: [2.2, 0.6, 12],
          color: 0xf59e0b
        },
        {
          id: 'flywheel',
          name: 'Inertial Flywheel',
          category: 'Energy Storage',
          desc: 'Stores rotational energy and maintains consistent angular velocity across power strokes.',
          type: 'cylinder',
          pos: [0, -4, 6],
          size: [4, 0.8, 4],
          color: 0x64748b
        }
      ]

      const partsMesh = []

      engineParts.forEach((data) => {
        let geom
        if (data.type === 'cylinder') {
          geom = new THREE.CylinderGeometry(data.size[0], data.size[0], data.size[1], 32)
        } else if (data.type === 'torus') {
          geom = new THREE.TorusGeometry(data.size[0], data.size[1], 16, data.size[2])
        } else {
          geom = new THREE.BoxGeometry(data.size[0], data.size[1], data.size[2])
        }

        const mat = new THREE.MeshStandardMaterial({
          color: data.color,
          metalness: 0.85,
          roughness: 0.2,
          wireframe: false
        })

        const mesh = new THREE.Mesh(geom, mat)
        mesh.position.set(...data.pos)
        mesh.castShadow = true
        mesh.receiveShadow = true
        scene.add(mesh)

        const group = new THREE.Group()
        group.add(mesh)
        group.userData = data
        scene.add(group)
        objectsRef.current.push(group)
        partsMesh.push({ group, mesh, id: data.id })
      })

      // Animation loop for engine
      let clock = new THREE.Clock()
      const animateEngine = () => {
        if (!rendererRef.current) return
        const elapsedTime = clock.getElapsedTime()

        if (isPlaying && motionEnabled) {
          partsMesh.forEach((p, idx) => {
            const dir = idx % 2 === 0 ? 1 : -1
            p.mesh.rotation.y = elapsedTime * speed * 1.5 * dir
            if (p.id === 'piston') {
              p.mesh.position.y = 2 + Math.sin(elapsedTime * speed * 3) * 1.5
            }
          })
        }

        renderer.render(scene, camera)
        animIdRef.current = requestAnimationFrame(animateEngine)
      }
      animIdRef.current = requestAnimationFrame(animateEngine)
    }

    // Click handler for raycasting objects
    const onClick = (event) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(scene.children, true)

      if (intersects.length > 0) {
        let obj = intersects[0].object
        while (obj && !obj.userData?.id && obj.parent) {
          obj = obj.parent
        }
        if (obj && obj.userData?.id) {
          setSelectedInfo(obj.userData)
        }
      }
    }

    canvas.addEventListener('click', onClick)

    // Resize handler
    const handleResize = () => {
      if (!canvas || !rendererRef.current) return
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      rendererRef.current.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (canvas) canvas.removeEventListener('click', onClick)
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current)
      if (rendererRef.current) {
        rendererRef.current.dispose()
        rendererRef.current = null
      }
    }
  }, [mode, isPlaying, speed, motionEnabled])

  const resetCamera = () => {
    setSelectedInfo(null)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  return (
    <section id="playground" className="py-24 px-6 bg-darkBg relative overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cardBg border border-cardBorder text-xs tracking-widest text-lightText uppercase mb-4">
            <Sparkles size={13} className="text-brandAccent" />
            <span>Interactive 3D Playground</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display text-lightText uppercase tracking-tight mb-4">
            Immersive 3D Experiences
          </h2>
          <p className="text-mutedText text-sm sm:text-base max-w-xl mx-auto font-body">
            Explore the futuristic digital city or inspect the high-performance mechanical engine simulator in real-time 3D WebGL.
          </p>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => switchMode('city')}
            className={`flex items-center gap-2.5 px-6 py-3.5 text-xs font-mono uppercase tracking-widest border transition-all duration-300 cursor-pointer ${
              mode === 'city'
                ? 'bg-brandAccent text-lightText border-brandAccent shadow-lg shadow-brandAccent/20'
                : 'bg-cardBg text-mutedText border-cardBorder hover:border-brandAccent/60 hover:text-lightText'
            }`}
          >
            <Building2 size={16} />
            <span>Digital City</span>
          </button>

          <button
            type="button"
            onClick={() => switchMode('engine')}
            className={`flex items-center gap-2.5 px-6 py-3.5 text-xs font-mono uppercase tracking-widest border transition-all duration-300 cursor-pointer ${
              mode === 'engine'
                ? 'bg-brandAccent text-lightText border-brandAccent shadow-lg shadow-brandAccent/20'
                : 'bg-cardBg text-mutedText border-cardBorder hover:border-brandAccent/60 hover:text-lightText'
            }`}
          >
            <Cog size={16} />
            <span>Mechanical Engine</span>
          </button>
        </div>

        {/* Main Viewport Container */}
        <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-cardBg border border-cardBorder p-6 sm:p-8 relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-brandAccent" />

          {/* Canvas & Scene Area */}
          <div className="lg:col-span-8 h-[400px] sm:h-[500px] bg-[#090909] border border-cardBorder relative overflow-hidden flex items-center justify-center">
            <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

            {/* Loading overlay */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#090909]/90 backdrop-blur-sm flex flex-col items-center justify-center z-20"
                >
                  <div className="w-8 h-8 border-2 border-brandAccent border-t-transparent rounded-full animate-spin mb-3" />
                  <span className="text-xs font-mono text-brandAccent uppercase tracking-widest">
                    Loading {mode === 'city' ? 'Digital City' : 'Mechanical Engine'}...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating Top-Left Badge */}
            <div className="absolute top-4 left-4 bg-darkBg/80 backdrop-blur-md border border-cardBorder px-3 py-1.5 flex items-center gap-2 pointer-events-none">
              <span className={`w-2 h-2 rounded-full bg-brandAccent ${motionEnabled ? 'animate-pulse' : ''}`} />
              <span className="text-[10px] font-mono text-lightText uppercase tracking-widest">
                {mode === 'city' ? 'Mode: Digital City (Interactive Buildings)' : 'Mode: Mechanical Engine (Simulation)'}
              </span>
            </div>

            {/* Floating Bottom Toolbar */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-auto bg-darkBg/90 backdrop-blur-md border border-cardBorder p-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cardBg border border-cardBorder text-lightText text-xs font-mono uppercase hover:border-brandAccent transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause size={13} className="text-brandAccent" /> : <Play size={13} className="text-brandAccent" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                {mode === 'engine' && (
                  <div className="flex items-center gap-2 text-xs font-mono text-mutedText">
                    <span>Speed:</span>
                    <select
                      value={speed}
                      onChange={(e) => setSpeed(Number(e.target.value))}
                      className="bg-cardBg border border-cardBorder text-lightText px-2 py-1 text-xs font-mono cursor-pointer"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={1}>1.0x</option>
                      <option value={2}>2.0x</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetCamera}
                  className="p-2 bg-cardBg border border-cardBorder text-lightText hover:border-brandAccent transition-colors cursor-pointer"
                  title="Reset View"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-2 bg-cardBg border border-cardBorder text-lightText hover:border-brandAccent transition-colors cursor-pointer"
                  title="Toggle Fullscreen"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Info Panel & Details */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Info size={16} className="text-brandAccent" />
                <span className="text-xs font-mono text-brandAccent uppercase tracking-widest">
                  Inspection Panel
                </span>
              </div>

              {selectedInfo ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#090909] border border-brandAccent/40 p-5 relative"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-brandAccent" />
                  <span className="text-[10px] font-mono text-brandAccent uppercase tracking-widest block mb-1">
                    {selectedInfo.category}
                  </span>
                  <h3 className="font-display text-2xl text-lightText uppercase tracking-wide mb-3">
                    {selectedInfo.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-mutedText font-body leading-relaxed mb-4">
                    {selectedInfo.desc}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-lightText">
                    <CheckCircle2 size={14} className="text-brandAccent" />
                    <span>Interactive 3D Component Loaded</span>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-[#090909] border border-cardBorder p-5 text-center">
                  <p className="text-xs sm:text-sm text-mutedText font-body leading-relaxed mb-3">
                    {mode === 'city'
                      ? 'Click on any building in the digital city to inspect portfolio details and project architecture.'
                      : 'Click on any engine component in the 3D simulator to view technical specifications and functions.'}
                  </p>
                  <span className="inline-block px-3 py-1 bg-cardBg border border-cardBorder text-[10px] font-mono text-brandAccent uppercase tracking-wider">
                    Interactive Raycasting Ready
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#090909] border border-cardBorder">
              <span className="text-[10px] font-mono text-mutedText uppercase tracking-widest block mb-2">
                Playground Controls Guide
              </span>
              <ul className="text-xs text-mutedText space-y-1.5 font-mono">
                <li>• Click & Drag: Rotate 3D Camera</li>
                <li>• Click Object: Inspect Details</li>
                <li>• Play / Pause: Toggle Animation</li>
                <li>• Mode Switcher: Toggle City / Engine</li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
