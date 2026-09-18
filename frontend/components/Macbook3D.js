"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { usePrefersReducedMotion, useIsTouch } from "@/lib/hooks";
import styles from "./Macbook3D.module.css";

// Balanced, elegant Apple 3/4 isometric hero angle
const DEFAULT_HERO_POSE = {
  cameraPos: [0, 0.65, 3.15],
  cameraTarget: [0, 0.02, 0],
  baseRot: { x: 0.18, y: -0.36, z: -0.015 },
};

// Procedural UI Generator for laptop screen
function createProjectCanvas(type) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 640;
  const ctx = c.getContext("2d");
  
  // Background
  ctx.fillStyle = "#0A0A0A";
  ctx.fillRect(0, 0, 1024, 640);
  
  // Header (macOS style)
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, 1024, 60);
  
  // Window controls
  ctx.fillStyle = "#FF5F56";
  ctx.beginPath(); ctx.arc(30, 30, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#FFBD2E";
  ctx.beginPath(); ctx.arc(55, 30, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#27C93F";
  ctx.beginPath(); ctx.arc(80, 30, 8, 0, Math.PI * 2); ctx.fill();
  
  ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "#ffffff";
  
  if (type === 'lifetrackr') {
    ctx.fillText("LifeTrackr Dashboard", 110, 38);
    // UI elements
    ctx.fillStyle = "#151515";
    ctx.fillRect(40, 100, 600, 300);
    ctx.fillRect(660, 100, 320, 140);
    ctx.fillRect(660, 260, 320, 140);
    
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("Activity Overview", 80, 150);
    
    // Chart lines
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(80, 340);
    ctx.lineTo(200, 260);
    ctx.lineTo(350, 300);
    ctx.lineTo(500, 180);
    ctx.lineTo(600, 220);
    ctx.stroke();
    
    // Fill under chart
    ctx.lineTo(600, 400);
    ctx.lineTo(80, 400);
    ctx.fillStyle = "rgba(56, 189, 248, 0.1)";
    ctx.fill();
  } else if (type === 'hog') {
    ctx.fillText("House of Gamers", 110, 38);
    // Grid of cards
    for(let i=0; i<3; i++) {
       for(let j=0; j<2; j++) {
         ctx.fillStyle = "#151515";
         ctx.fillRect(40 + i*320, 100 + j*260, 290, 230);
         // Image placeholder
         ctx.fillStyle = i % 2 === 0 ? "#4338ca" : "#6d28d9";
         ctx.fillRect(40 + i*320, 100 + j*260, 290, 140);
       }
    }
  } else if (type === 'portfolio') {
    ctx.fillText("Saumya.dev - VS Code", 110, 38);
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 60, 1024, 580);
    
    ctx.fillStyle = "#252526"; // sidebar
    ctx.fillRect(0, 60, 220, 580);
    
    ctx.font = "20px monospace";
    ctx.fillStyle = "#4ec9b0"; // class color
    ctx.fillText("function", 260, 120);
    ctx.fillStyle = "#dcdcaa"; // function color
    ctx.fillText("Macbook3D", 360, 120);
    ctx.fillStyle = "#d4d4d4"; 
    ctx.fillText("() {", 470, 120);
    ctx.fillStyle = "#569cd6"; // keyword
    ctx.fillText("return", 300, 170);
    ctx.fillStyle = "#ce9178"; // string
    ctx.fillText("<Canvas />", 380, 170);
    ctx.fillStyle = "#d4d4d4"; 
    ctx.fillText("}", 260, 220);
  }
  
  return c;
}

export default function Macbook3D({ interactive = true }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const prefersReduced = usePrefersReducedMotion();
  const isTouch = useIsTouch();

  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadError, setLoadError] = useState(null);

  // Animation & Physics Engine Refs (Zero React re-render overhead)
  const engine = useRef({
    scene: null,
    camera: null,
    renderer: null,
    modelGroup: null,
    keyLight: null,
    rimLight: null,
    sweepLight: null,
    rafId: null,

    // Mouse Parallax Physics
    targetMouse: { x: 0, y: 0 },
    currentMouse: { x: 0, y: 0 },
    isHovered: false,

    // Scale Hover Physics (1.0 -> 1.02)
    targetScale: 1.0,
    currentScale: 1.0,

    // Click Impulse
    clickImpulse: { x: 0, y: 0 },
    
    // Scroll state
    scrollProgress: 0,
    targetScrollProgress: 0,
    
    // Screen texture
    screenCtx: null,
    screenTex: null,
    projects: []
  });

  // Mouse Parallax Handlers
  const handlePointerMove = (e) => {
    if (prefersReduced || isTouch || !interactive) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1); // -1 to 1

    engine.current.targetMouse.x = Math.max(-1, Math.min(1, nx));
    engine.current.targetMouse.y = Math.max(-1, Math.min(1, ny));
    engine.current.isHovered = true;
    engine.current.targetScale = 1.02; // +2% subtle depth on hover
  };

  const handlePointerLeave = () => {
    engine.current.targetMouse.x = 0;
    engine.current.targetMouse.y = 0;
    engine.current.isHovered = false;
    engine.current.targetScale = 1.0;
  };

  // Subtle click tactile micro-nudge
  const handleClick = () => {
    if (!interactive || prefersReduced) return;
    engine.current.clickImpulse.y += 0.025;
    engine.current.clickImpulse.x += 0.01;
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const eng = engine.current;
    let width = container.clientWidth || 520;
    let height = container.clientHeight || 440;

    // 1. Scene
    const scene = new THREE.Scene();
    eng.scene = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    camera.position.set(...DEFAULT_HERO_POSE.cameraPos);
    camera.lookAt(...DEFAULT_HERO_POSE.cameraTarget);
    eng.camera = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    eng.renderer = renderer;

    // 4. Space Black Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(3.5, 5.5, 4.0);
    scene.add(keyLight);
    eng.keyLight = keyLight;

    const cyanRim = new THREE.DirectionalLight(0x38bdf8, 1.4);
    cyanRim.position.set(-4.0, 3.0, -3.0);
    scene.add(cyanRim);
    eng.rimLight = cyanRim;

    const softFill = new THREE.DirectionalLight(0xffffff, 0.45);
    softFill.position.set(-3.0, 1.5, 3.0);
    scene.add(softFill);
    
    // Cinematic Sweep Light (moves across laptop)
    const sweepLight = new THREE.PointLight(0xffffff, 0, 4.0);
    scene.add(sweepLight);
    eng.sweepLight = sweepLight;

    // 5. Soft Ground Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext("2d");
    const sGrad = sCtx.createRadialGradient(64, 64, 8, 64, 64, 56);
    sGrad.addColorStop(0, "rgba(0, 0, 0, 0.65)");
    sGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.18)");
    sGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.38;
    scene.add(shadowMesh);

    // 6. Model Container Group
    const modelGroup = new THREE.Group();
    modelGroup.rotation.set(
      DEFAULT_HERO_POSE.baseRot.x,
      DEFAULT_HERO_POSE.baseRot.y,
      DEFAULT_HERO_POSE.baseRot.z
    );
    scene.add(modelGroup);
    eng.modelGroup = modelGroup;
    
    // Prepare screen textures
    eng.projects = [
      createProjectCanvas('portfolio'),
      createProjectCanvas('lifetrackr'),
      createProjectCanvas('hog')
    ];
    
    const finalScreenCanvas = document.createElement("canvas");
    finalScreenCanvas.width = 1024;
    finalScreenCanvas.height = 640;
    eng.screenCtx = finalScreenCanvas.getContext("2d");
    eng.screenCtx.drawImage(eng.projects[0], 0, 0);
    
    eng.screenTex = new THREE.CanvasTexture(finalScreenCanvas);
    eng.screenTex.colorSpace = THREE.SRGBColorSpace;
    eng.screenTex.flipY = false; // GLTF models usually need this false

    // 7. Load 3D GLB Model
    const loader = new GLTFLoader();
    const modelPath = "/models/macbook_pro_14-inch_m5.glb";

    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;

        const bbox = new THREE.Box3().setFromObject(model);
        const center = bbox.getCenter(new THREE.Vector3());
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.48 / maxDim;

        model.scale.setScalar(scale);
        model.position.x = -center.x * scale;
        model.position.y = -center.y * scale - 0.02;
        model.position.z = -center.z * scale;

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Screen Material replacement (Index 27 or name "HlQwFCAPWzetDQy")
            // A safer approach is to check for the material name if possible, or just index 27.
            // But if it's a multi-material, we might need to be careful.
            // We know from previous inspection it's material index 27. Let's just find it by name or replace all emissive black materials.
            // In the M5 model, the screen usually has a specific name or is the only one emitting nothing but is placed on the screen.
            // The previous summary explicitly says: "Material index 27 (HlQwFCAPWzetDQy)".
            if (Array.isArray(child.material)) {
                // If it's an array of materials
                for (let i = 0; i < child.material.length; i++) {
                    if (child.material[i].name === 'HlQwFCAPWzetDQy' || i === 27) {
                        child.material[i] = new THREE.MeshBasicMaterial({
                            map: eng.screenTex
                        });
                    }
                }
            } else if (child.material.name === 'HlQwFCAPWzetDQy') {
                child.material = new THREE.MeshBasicMaterial({
                    map: eng.screenTex
                });
            }

            if (child.material && !child.material.map) {
              child.material.envMapIntensity = 0.9;
            }
          }
        });

        modelGroup.add(model);
        setLoading(false);
      },
      (xhr) => {
        if (xhr.total > 0) {
          setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
        } else {
          setLoadProgress((prev) => Math.min(95, prev + 10));
        }
      },
      (err) => {
        console.error("Error loading 3D MacBook:", err);
        setLoadError("Failed to load 3D model.");
        setLoading(false);
      }
    );
    
    // Scroll Listener
    const onScroll = () => {
      // Calculate scroll progress (0 to 1) across the whole page, or specific sections
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
         eng.targetScrollProgress = window.scrollY / maxScroll;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // 8. 60 FPS Animation Loop
    let startTime = performance.now();

    const animate = (now) => {
      eng.rafId = requestAnimationFrame(animate);
      const elapsedSec = (now - startTime) * 0.001;

      // Mouse parallax damping
      const mouseDamp = 0.045;
      eng.currentMouse.x += (eng.targetMouse.x - eng.currentMouse.x) * mouseDamp;
      eng.currentMouse.y += (eng.targetMouse.y - eng.currentMouse.y) * mouseDamp;

      // Scale damping
      eng.currentScale += (eng.targetScale - eng.currentScale) * 0.06;
      
      // Rim light brightening on hover
      if (eng.rimLight) {
         const targetRim = eng.isHovered ? 2.5 : 1.4;
         eng.rimLight.intensity += (targetRim - eng.rimLight.intensity) * 0.1;
      }
      
      // Light Sweep (every 10 seconds)
      const sweepCycle = elapsedSec % 10.0;
      if (sweepCycle > 8.0 && sweepCycle < 9.5) {
         // Active sweep
         const t = (sweepCycle - 8.0) / 1.5; // 0 to 1
         eng.sweepLight.intensity = Math.sin(t * Math.PI) * 5.0; // Peak at 5.0
         eng.sweepLight.position.set(-2.0 + (t * 4.0), 1.0, 1.0); // Sweep from -2 to +2 X
      } else {
         eng.sweepLight.intensity = 0;
      }

      // Scroll damping
      eng.scrollProgress += (eng.targetScrollProgress - eng.scrollProgress) * 0.05;
      
      // Update screen texture based on scroll
      if (eng.screenCtx && eng.screenTex) {
         // Project section is roughly around 30% to 60% scroll
         // 0-0.3: portfolio, 0.3-0.45: lifetrackr, >0.45: hog
         let currentProj = 0;
         if (eng.scrollProgress > 0.45) currentProj = 2;
         else if (eng.scrollProgress > 0.25) currentProj = 1;
         
         // In a real scenario we'd crossfade based on exact progress, but drawing the active one is very fast
         // We can do a simple fade by drawing a black rect with low alpha, then the project
         eng.screenCtx.globalAlpha = 1.0;
         eng.screenCtx.drawImage(eng.projects[currentProj], 0, 0);
         eng.screenTex.needsUpdate = true;
      }

      eng.clickImpulse.x *= 0.92;
      eng.clickImpulse.y *= 0.92;

      const idleTime = elapsedSec * 0.52;
      const idleSwayY = !prefersReduced ? Math.sin(idleTime) * 0.055 : 0;
      const idleTiltX = !prefersReduced ? Math.cos(idleTime * 0.8) * 0.016 : 0;
      const idleBobY = !prefersReduced ? Math.sin(idleTime * 1.2) * 0.010 : 0;

      const parallaxRotY = !prefersReduced ? eng.currentMouse.x * 0.14 : 0;
      const parallaxRotX = !prefersReduced ? -eng.currentMouse.y * 0.07 : 0;

      if (modelGroup) {
        // Apply scroll-based rotation overrides
        // Starts at DEFAULT_HERO_POSE, rotates slowly as user scrolls down
        const scrollRotX = eng.scrollProgress * 0.5; // tilts up slightly
        const scrollRotY = eng.scrollProgress * -1.2; // rotates to the left

        modelGroup.rotation.x = DEFAULT_HERO_POSE.baseRot.x + idleTiltX + parallaxRotX + eng.clickImpulse.x + scrollRotX;
        modelGroup.rotation.y = DEFAULT_HERO_POSE.baseRot.y + idleSwayY + parallaxRotY + eng.clickImpulse.y + scrollRotY;
        modelGroup.rotation.z = DEFAULT_HERO_POSE.baseRot.z;

        modelGroup.position.y = idleBobY;
        
        // Also move camera slightly back on scroll
        camera.position.z = DEFAULT_HERO_POSE.cameraPos[2] + (eng.scrollProgress * 1.5);

        modelGroup.scale.setScalar(eng.currentScale);
      }

      renderer.render(scene, camera);
    };

    eng.rafId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      window.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      if (eng.rafId) {
        cancelAnimationFrame(eng.rafId);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [prefersReduced, isTouch, interactive]);

  return (
    <div
      className={styles.wrapper}
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      aria-label="Interactive 3D MacBook Pro"
    >
      {/* Cinematic subtle background glow */}
      <div className={styles.ambientGlow} />

      {/* Top Spec Badge */}
      <div className={styles.topSpecBadge}>
        <svg className={styles.appleSvg} viewBox="0 0 170 170" fill="currentColor" aria-hidden="true">
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.99-6.3-9.77-11.1-20.78-14.41-33.04-3.3-12.26-4.96-23.7-4.96-34.33 0-14.12 3.49-25.96 10.46-35.53 6.98-9.56 15.82-14.45 26.54-14.67 4.79 0 10.23 1.25 16.32 3.76 6.09 2.5 9.92 3.82 11.5 3.94 1.86-.12 5.94-1.5 12.24-4.14 6.31-2.64 11.6-3.83 15.88-3.57 11.97.77 21.6 5.3 28.89 13.59-10.45 6.32-15.54 15.22-15.27 26.7.27 9.02 3.69 16.63 10.27 22.83 6.57 6.2 14.32 9.57 23.23 10.12-2.12 6.64-4.8 13.12-8.04 19.46zM119.22 31.84c0-7.39 2.65-14.07 7.95-20.04 5.31-5.97 11.75-9.69 19.33-11.16.22 1.3.33 2.5.33 3.59 0 7.39-2.77 14.28-8.31 20.67-5.54 6.39-12.06 10.09-19.56 11.1-0.11-1.3-.17-2.7-.17-4.16z"/>
        </svg>
        <div className={styles.specText}>
          <span className={styles.specTitle}>MacBook Pro 14″</span>
          <span className={styles.specChip}>Apple M5 · Space Black</span>
        </div>
      </div>

      {/* 3D Canvas */}
      <canvas ref={canvasRef} className={styles.canvas3d} />

      {/* Subtle Loading Spinner */}
      {loading && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loaderSpinner} />
          <span className={styles.loaderText}>
            Loading 3D Model ({loadProgress}%)
          </span>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${loadProgress}%` }} />
          </div>
        </div>
      )}

      {/* Error state */}
      {loadError && (
        <div className={styles.errorOverlay}>
          <span>⚠️ {loadError}</span>
        </div>
      )}
    </div>
  );
}
