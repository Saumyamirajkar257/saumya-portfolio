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

  if (type === "lifetrackr") {
    ctx.fillText("LifeTrackr - Health & Vitals Dashboard", 110, 38);
    // UI elements
    ctx.fillStyle = "#141417";
    ctx.fillRect(40, 100, 600, 300);
    ctx.fillRect(660, 100, 320, 140);
    ctx.fillRect(660, 260, 320, 140);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "600 18px -apple-system, sans-serif";
    ctx.fillText("Real-time Sensor Telemetry", 70, 140);

    // Chart lines
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(70, 320);
    ctx.lineTo(180, 240);
    ctx.lineTo(320, 280);
    ctx.lineTo(460, 190);
    ctx.lineTo(580, 230);
    ctx.stroke();

    // Fill under chart
    ctx.lineTo(580, 360);
    ctx.lineTo(70, 360);
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fill();

    // Right widgets
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 28px -apple-system, sans-serif";
    ctx.fillText("98.6°F", 690, 160);
    ctx.font = "14px monospace";
    ctx.fillStyle = "#A1A1AA";
    ctx.fillText("Body Temp · Normal", 690, 190);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 28px -apple-system, sans-serif";
    ctx.fillText("74 BPM", 690, 320);
    ctx.font = "14px monospace";
    ctx.fillStyle = "#A1A1AA";
    ctx.fillText("Heart Rate · Resting", 690, 350);
  } else if (type === "wiper") {
    ctx.fillText("Automatic Rain Sensing Wiper (Embedded C++)", 110, 38);
    ctx.fillStyle = "#121215";
    ctx.fillRect(0, 60, 1024, 580);

    ctx.font = "19px monospace";
    ctx.fillStyle = "#A1A1AA";
    ctx.fillText("// Arduino / ESP32 Rain Sensor Controller", 60, 120);

    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("#define RAIN_PIN A0", 60, 160);
    ctx.fillText("#define SERVO_PIN 9", 60, 195);
    ctx.fillText("Servo wiperServo;", 60, 230);

    ctx.fillText("void loop() {", 60, 280);
    ctx.fillText("  int val = analogRead(RAIN_PIN);", 90, 315);
    ctx.fillText("  int speed = map(val, 1023, 0, 0, 180);", 90, 350);
    ctx.fillText("  wiperServo.write(speed);", 90, 385);
    ctx.fillText("  delay(speed > 50 ? 200 : 800);", 90, 420);
    ctx.fillText("}", 60, 455);
  } else {
    ctx.fillText("Saumya Mirajkar · Developer Terminal", 110, 38);
    ctx.fillStyle = "#121215";
    ctx.fillRect(0, 60, 1024, 580);

    ctx.font = "18px monospace";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("saumya@portfolio:~$ neofetch --engineer", 60, 120);

    ctx.fillStyle = "#A1A1AA";
    ctx.fillText("---------------------------------------", 60, 150);
    ctx.fillText("OS: IoT & Embedded Systems (C/C++, Python)", 60, 185);
    ctx.fillText("Host: Cusrow Wadia Institute of Technology", 60, 220);
    ctx.fillText("Hardware: Arduino, ESP8266/ESP32, Microcontrollers", 60, 255);
    ctx.fillText("Web: Next.js, React, FastAPI, Node.js", 60, 290);
    ctx.fillText("Status: Available for Internships & Projects ✓", 60, 325);
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

  // Animation & Physics Engine Refs
  const engine = useRef({
    scene: null,
    camera: null,
    renderer: null,
    modelGroup: null,
    lidMesh: null,
    keyLight: null,
    rimLight: null,
    sweepLight: null,
    rafId: null,

    // Smooth Unfold / Open Animation
    openProgress: 0.0,
    targetOpenProgress: 1.0,

    // Mouse Parallax & Drag Orbit Physics
    targetMouse: { x: 0, y: 0 },
    currentMouse: { x: 0, y: 0 },
    isHovered: false,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    dragDelta: { x: 0, y: 0 },

    // Scale Hover Physics
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
    projects: [],
    activeProjectIndex: 0,
  });

  // Pointer Movement Handlers
  const handlePointerMove = (e) => {
    if (prefersReduced || isTouch || !interactive) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    engine.current.targetMouse.x = Math.max(-1, Math.min(1, nx));
    engine.current.targetMouse.y = Math.max(-1, Math.min(1, ny));

    if (engine.current.isDragging) {
      const dx = (e.clientX - engine.current.dragStart.x) * 0.005;
      const dy = (e.clientY - engine.current.dragStart.y) * 0.005;
      engine.current.dragDelta.x = dx;
      engine.current.dragDelta.y = dy;
    }
  };

  const handlePointerDown = (e) => {
    if (prefersReduced || isTouch || !interactive) return;
    engine.current.isDragging = true;
    engine.current.dragStart.x = e.clientX;
    engine.current.dragStart.y = e.clientY;
  };

  const handlePointerUp = () => {
    engine.current.isDragging = false;
  };

  const handlePointerEnter = () => {
    engine.current.isHovered = true;
    engine.current.targetScale = 1.02;
  };

  const handlePointerLeave = () => {
    engine.current.isHovered = false;
    engine.current.isDragging = false;
    engine.current.targetMouse.x = 0;
    engine.current.targetMouse.y = 0;
    engine.current.targetScale = 1.0;
  };

  const handleClick = () => {
    if (!interactive) return;
    engine.current.clickImpulse.x = 0.06;
    engine.current.clickImpulse.y = -0.04;

    // Cycle through project screens
    const eng = engine.current;
    if (eng.screenCtx && eng.screenTex && eng.projects.length) {
      eng.activeProjectIndex = (eng.activeProjectIndex + 1) % eng.projects.length;
      eng.screenCtx.drawImage(eng.projects[eng.activeProjectIndex], 0, 0);
      eng.screenTex.needsUpdate = true;
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const eng = engine.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    eng.scene = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(
      DEFAULT_HERO_POSE.cameraPos[0],
      DEFAULT_HERO_POSE.cameraPos[1],
      DEFAULT_HERO_POSE.cameraPos[2] + 0.8 // starts slightly further and zooms in smoothly
    );
    camera.lookAt(
      DEFAULT_HERO_POSE.cameraTarget[0],
      DEFAULT_HERO_POSE.cameraTarget[1],
      DEFAULT_HERO_POSE.cameraTarget[2]
    );
    eng.camera = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isTouch ? 1 : 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    eng.renderer = renderer;

    // 4. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(3.5, 5.5, 4.0);
    scene.add(keyLight);
    eng.keyLight = keyLight;

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(-4.0, 3.0, -3.0);
    scene.add(rimLight);
    eng.rimLight = rimLight;

    const softFill = new THREE.DirectionalLight(0xffffff, 0.4);
    softFill.position.set(-3.0, 1.5, 3.0);
    scene.add(softFill);

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

    // 6. Model Container Group (starts angled & unfolds on load)
    const modelGroup = new THREE.Group();
    modelGroup.rotation.set(
      DEFAULT_HERO_POSE.baseRot.x + 0.45, // starts tilted forward
      DEFAULT_HERO_POSE.baseRot.y - 0.25,
      DEFAULT_HERO_POSE.baseRot.z
    );
    scene.add(modelGroup);
    eng.modelGroup = modelGroup;

    // Prepare screen textures
    eng.projects = [
      createProjectCanvas("terminal"),
      createProjectCanvas("lifetrackr"),
      createProjectCanvas("wiper"),
    ];

    const finalScreenCanvas = document.createElement("canvas");
    finalScreenCanvas.width = 1024;
    finalScreenCanvas.height = 640;
    eng.screenCtx = finalScreenCanvas.getContext("2d");
    eng.screenCtx.drawImage(eng.projects[0], 0, 0);
    eng.activeProjectIndex = 0;

    eng.screenTex = new THREE.CanvasTexture(finalScreenCanvas);
    eng.screenTex.colorSpace = THREE.SRGBColorSpace;
    eng.screenTex.flipY = false;

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

            if (Array.isArray(child.material)) {
              for (let i = 0; i < child.material.length; i++) {
                if (child.material[i].name === "HlQwFCAPWzetDQy" || i === 27) {
                  child.material[i] = new THREE.MeshBasicMaterial({
                    map: eng.screenTex,
                  });
                }
              }
            } else if (child.material && child.material.name === "HlQwFCAPWzetDQy") {
              child.material = new THREE.MeshBasicMaterial({
                map: eng.screenTex,
              });
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
    let maxScroll = 1;
    const updateMaxScroll = () => {
      maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    };
    updateMaxScroll();

    const onScroll = () => {
      eng.targetScrollProgress = window.scrollY / maxScroll;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateMaxScroll, { passive: true });
    onScroll();

    // 8. 60 FPS Animation Loop
    let startTime = performance.now();
    eng.isVisible = true;

    const animate = (now) => {
      if (!eng.isVisible) return;

      eng.rafId = requestAnimationFrame(animate);
      const elapsedSec = (now - startTime) * 0.001;

      // Smooth Opening Unfold Animation (Spring from 0 to 1)
      eng.openProgress += (eng.targetOpenProgress - eng.openProgress) * 0.035;

      // Mouse parallax & drag damping
      const mouseDamp = 0.045;
      eng.currentMouse.x += (eng.targetMouse.x - eng.currentMouse.x) * mouseDamp;
      eng.currentMouse.y += (eng.targetMouse.y - eng.currentMouse.y) * mouseDamp;

      // Drag decay
      if (!eng.isDragging) {
        eng.dragDelta.x *= 0.94;
        eng.dragDelta.y *= 0.94;
      }

      // Scale damping
      eng.currentScale += (eng.targetScale - eng.currentScale) * 0.06;

      // Scroll damping
      eng.scrollProgress += (eng.targetScrollProgress - eng.scrollProgress) * 0.05;

      // Automatic screen texture update on scroll
      if (eng.screenCtx && eng.screenTex) {
        let currentProj = 0;
        if (eng.scrollProgress > 0.45) currentProj = 2;
        else if (eng.scrollProgress > 0.2) currentProj = 1;

        if (eng.activeProjectIndex !== currentProj) {
          eng.activeProjectIndex = currentProj;
          eng.screenCtx.drawImage(eng.projects[currentProj], 0, 0);
          eng.screenTex.needsUpdate = true;
        }
      }

      eng.clickImpulse.x *= 0.92;
      eng.clickImpulse.y *= 0.92;

      // Idle breathing physics
      const idleTime = elapsedSec * 0.52;
      const idleSwayY = !prefersReduced ? Math.sin(idleTime) * 0.04 : 0;
      const idleTiltX = !prefersReduced ? Math.cos(idleTime * 0.8) * 0.012 : 0;
      const idleBobY = !prefersReduced ? Math.sin(idleTime * 1.2) * 0.008 : 0;

      const parallaxRotY = !prefersReduced ? (eng.currentMouse.x * 0.16 + eng.dragDelta.x) : 0;
      const parallaxRotX = !prefersReduced ? (-eng.currentMouse.y * 0.09 + eng.dragDelta.y) : 0;

      if (modelGroup) {
        // Unfold interpolation: from initial folded angle to final pose
        const unfoldRotX = (1 - eng.openProgress) * 0.45;
        const unfoldRotY = (1 - eng.openProgress) * -0.25;

        // Scroll response: subtle dynamic tilt forward
        const scrollRotX = eng.scrollProgress * 0.6;
        const scrollRotY = eng.scrollProgress * -1.0;

        modelGroup.rotation.x =
          DEFAULT_HERO_POSE.baseRot.x + unfoldRotX + idleTiltX + parallaxRotX + eng.clickImpulse.x + scrollRotX;
        modelGroup.rotation.y =
          DEFAULT_HERO_POSE.baseRot.y + unfoldRotY + idleSwayY + parallaxRotY + eng.clickImpulse.y + scrollRotY;
        modelGroup.rotation.z = DEFAULT_HERO_POSE.baseRot.z;

        modelGroup.position.y = idleBobY;

        // Camera zoom: smoothly zooms in as the lid unfolds
        const cameraZ =
          DEFAULT_HERO_POSE.cameraPos[2] + (1 - eng.openProgress) * 0.8 + eng.scrollProgress * 1.4;
        camera.position.z = cameraZ;

        modelGroup.scale.setScalar(eng.currentScale * (0.9 + eng.openProgress * 0.1));
      }

      renderer.render(scene, camera);
    };

    eng.rafId = requestAnimationFrame(animate);

    // Pause rendering loop when MacBook is out of viewport
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        eng.isVisible = entry.isIntersecting;
        if (eng.isVisible) {
          if (eng.rafId) cancelAnimationFrame(eng.rafId);
          eng.rafId = requestAnimationFrame(animate);
        } else if (eng.rafId) {
          cancelAnimationFrame(eng.rafId);
          eng.rafId = null;
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

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
      window.removeEventListener("resize", updateMaxScroll);
      intersectionObserver.disconnect();
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
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      aria-label="Interactive 3D MacBook Pro (Click to switch screens, scroll to inspect)"
      style={{ cursor: "grab" }}
    >
      {/* Subtle background ambient backlight */}
      <div className={styles.ambientGlow} />

      {/* Top Spec Badge */}
      <div className={styles.topSpecBadge}>
        <svg className={styles.appleSvg} viewBox="0 0 170 170" fill="currentColor" aria-hidden="true">
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.99-6.3-9.77-11.1-20.78-14.41-33.04-3.3-12.26-4.96-23.7-4.96-34.33 0-14.12 3.49-25.96 10.46-35.53 6.98-9.56 15.82-14.45 26.54-14.67 4.79 0 10.23 1.25 16.32 3.76 6.09 2.5 9.92 3.82 11.5 3.94 1.86-.12 5.94-1.5 12.24-4.14 6.31-2.64 11.6-3.83 15.88-3.57 11.97.77 21.6 5.3 28.89 13.59-10.45 6.32-15.54 15.22-15.27 26.7.27 9.02 3.69 16.63 10.27 22.83 6.57 6.2 14.32 9.57 23.23 10.12-2.12 6.64-4.8 13.12-8.04 19.46zM119.22 31.84c0-7.39 2.65-14.07 7.95-20.04 5.31-5.97 11.75-9.69 19.33-11.16.22 1.3.33 2.5.33 3.59 0 7.39-2.77 14.28-8.31 20.67-5.54 6.39-12.06 10.09-19.56 11.1-0.11-1.3-.17-2.7-.17-4.16z"/>
        </svg>
        <div className={styles.specText}>
          <span className={styles.specTitle}>MacBook Pro 14″</span>
          <span className={styles.specChip}>Click screen to switch · Drag to tilt</span>
        </div>
      </div>

      {/* 3D Canvas */}
      <canvas ref={canvasRef} className={styles.canvas3d} />

      {/* Subtle Loading Spinner */}
      {loading && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loaderSpinner} />
          <span className={styles.loaderText}>
            Loading 3D MacBook ({loadProgress}%)
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
