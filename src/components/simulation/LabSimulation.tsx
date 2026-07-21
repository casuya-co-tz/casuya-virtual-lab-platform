'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface LabSimulationProps {
  subject: string
  config?: Record<string, unknown>
}

export function LabSimulation({ subject }: LabSimulationProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)

    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 100)
    camera.position.set(5, 5, 10)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mountRef.current.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    const ambientLight = new THREE.AmbientLight(0x404060, 1)
    scene.add(ambientLight)

    const directionLight = new THREE.DirectionalLight(0xffffff, 2)
    directionLight.position.set(5, 10, 7)
    scene.add(directionLight)

    const gridHelper = new THREE.GridHelper(10, 10, 0x444466, 0x333355)
    scene.add(gridHelper)

    const subjectObjects: Record<string, () => THREE.Object3D> = {
      physics: () => {
        const group = new THREE.Group()
        const wireframe = new THREE.Mesh(
          new THREE.SphereGeometry(1.5, 16, 12),
          new THREE.MeshStandardMaterial({ color: 0x3b82f6, wireframe: true, emissive: 0x1a3a6a, emissiveIntensity: 0.3 })
        )
        group.add(wireframe)

        const inner = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 16, 12),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0x7c3a00, emissiveIntensity: 0.2 })
        )
        group.add(inner)

        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(1.8, 0.05, 8, 32),
          new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x065f46, emissiveIntensity: 0.3 })
        )
        ring.rotation.x = Math.PI / 2
        group.add(ring)

        return group
      },
      chemistry: () => {
        const group = new THREE.Group()
        const flask = new THREE.Mesh(
          new THREE.CylinderGeometry(0.8, 1.2, 1.5, 16),
          new THREE.MeshPhysicalMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.4, roughness: 0.1, metalness: 0 })
        )
        flask.position.y = 0.75
        group.add(flask)

        const liquid = new THREE.Mesh(
          new THREE.CylinderGeometry(0.7, 1.0, 0.8, 16),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0x7c3a00, emissiveIntensity: 0.1 })
        )
        liquid.position.y = 0.4
        group.add(liquid)

        return group
      },
      biology: () => {
        const group = new THREE.Group()
        const cell = new THREE.Mesh(
          new THREE.SphereGeometry(1.2, 20, 16),
          new THREE.MeshPhysicalMaterial({ color: 0x34d399, transparent: true, opacity: 0.3, roughness: 0.3, metalness: 0 })
        )
        group.add(cell)

        const nucleus = new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 16, 12),
          new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x4c1d95, emissiveIntensity: 0.3 })
        )
        group.add(nucleus)

        return group
      },
    }

    const obj = subjectObjects[subject]?.() || subjectObjects.physics()
    scene.add(obj)

    let anim: number
    function animate() {
      anim = requestAnimationFrame(animate)
      obj.rotation.y += 0.005
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    function handleResize() {
      if (!mountRef.current) return
      const w = mountRef.current.clientWidth
      const h = mountRef.current.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(anim)
      renderer.dispose()
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [subject])

  return <div ref={mountRef} className="w-full h-full" />
}
