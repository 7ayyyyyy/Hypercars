/**
 * Hypercars 3D Showroom
 *
 * Procedural hypercar silhouette built from Three.js primitives.
 * Each car is constructed from: low body, glass canopy, four wheels,
 * a rear wing, and emissive light strips. The body color is taken
 * from the car data so the 3D model matches the brand.
 *
 * Usage:
 *   const showroom = new HypercarShowroom(canvasContainer, {
 *     car: carData,
 *     interactive: true,    // enable OrbitControls
 *     autoRotate: true,     // idle rotation
 *     background: 'gradient' | 'solid'
 *   });
 *   showroom.start();
 *   showroom.swapCar(newCarData);  // change car
 *   showroom.dispose();             // cleanup
 */

(function (global) {
  'use strict';

  // Lazy-load three.js from CDN if not already loaded
  function ensureThree() {
    if (global.THREE) return Promise.resolve(global.THREE);
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
      s.onload = () => resolve(global.THREE);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  class HypercarShowroom {
    constructor(container, options = {}) {
      this.container = container;
      this.options = Object.assign({
        car: null,
        interactive: true,
        autoRotate: true,
        background: 'gradient',
        cameraDistance: 7,
        cameraHeight: 1.5
      }, options);
      this.car = this.options.car;
      this.running = false;
      this.mouseDown = false;
      this.lastInteraction = 0;
      this.userRotY = 0;
      this.userRotX = 0;
      this.targetRotY = 0;
      this.targetRotX = 0;
      this.disposed = false;
    }

    async init() {
      const THREE = await ensureThree();
      this.THREE = THREE;
      this._buildScene();
      this._setupInteraction();
      this._renderCar();
      this._animate = this._animate.bind(this);
      this._animate();
      this.running = true;
    }

    _buildScene() {
      const THREE = this.THREE;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;

      // Scene
      this.scene = new THREE.Scene();
      if (this.options.background === 'gradient') {
        // Dark gradient via canvas texture
        const c = document.createElement('canvas');
        c.width = 2; c.height = 256;
        const ctx = c.getContext('2d');
        const g = ctx.createLinearGradient(0, 0, 0, 256);
        g.addColorStop(0, '#0a0a0c');
        g.addColorStop(0.6, '#14141a');
        g.addColorStop(1, '#1f1f28');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 2, 256);
        const tex = new THREE.CanvasTexture(c);
        this.scene.background = tex;
      } else {
        this.scene.background = new THREE.Color('#0a0a0c');
      }

      // Camera
      this.camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
      this.camera.position.set(0, this.options.cameraHeight, this.options.cameraDistance);
      this.camera.lookAt(0, 0.5, 0);

      // Renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.1;
      this.container.appendChild(this.renderer.domElement);

      // Lights
      const ambient = new THREE.AmbientLight(0xffffff, 0.4);
      this.scene.add(ambient);

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
      keyLight.position.set(4, 6, 4);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      this.scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0xdc2626, 0.6);
      rimLight.position.set(-5, 3, -3);
      this.scene.add(rimLight);

      const fillLight = new THREE.DirectionalLight(0x00d4ff, 0.3);
      fillLight.position.set(0, 2, -5);
      this.scene.add(fillLight);

      // Ground (subtle reflection)
      const groundGeo = new THREE.CircleGeometry(8, 64);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0c,
        metalness: 0.4,
        roughness: 0.5
      });
      this.ground = new THREE.Mesh(groundGeo, groundMat);
      this.ground.rotation.x = -Math.PI / 2;
      this.ground.position.y = -0.05;
      this.ground.receiveShadow = true;
      this.scene.add(this.ground);

      // Car group (rotated by interaction/auto-rotation)
      this.carGroup = new THREE.Group();
      this.scene.add(this.carGroup);

      // Window resize
      this._onResize = this._onResize.bind(this);
      window.addEventListener('resize', this._onResize);
    }

    _setupInteraction() {
      if (!this.options.interactive) return;
      const dom = this.renderer.domElement;

      const onDown = (e) => {
        this.mouseDown = true;
        this.lastInteraction = performance.now();
        this._dragStartX = (e.touches ? e.touches[0].clientX : e.clientX);
        this._dragStartY = (e.touches ? e.touches[0].clientY : e.clientY);
        this._dragBaseY = this.userRotY;
        this._dragBaseX = this.userRotX;
      };

      const onMove = (e) => {
        if (!this.mouseDown) return;
        e.preventDefault();
        const x = (e.touches ? e.touches[0].clientX : e.clientX);
        const y = (e.touches ? e.touches[0].clientY : e.clientY);
        const dx = x - this._dragStartX;
        const dy = y - this._dragStartY;
        this.targetRotY = this._dragBaseY + dx * 0.008;
        this.targetRotX = Math.max(-0.4, Math.min(0.4, this._dragBaseX - dy * 0.005));
        this.userRotY = this.targetRotY;
        this.userRotX = this.targetRotX;
        this.lastInteraction = performance.now();
      };

      const onUp = () => { this.mouseDown = false; };

      dom.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      dom.addEventListener('touchstart', onDown, { passive: true });
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onUp);

      // Cursor hint
      dom.style.cursor = 'grab';
      dom.addEventListener('mousedown', () => { dom.style.cursor = 'grabbing'; });
      dom.addEventListener('mouseup', () => { dom.style.cursor = 'grab'; });
    }

    _renderCar() {
      if (!this.car) return;
      // Remove existing car meshes
      while (this.carGroup.children.length > 0) {
        const child = this.carGroup.children[0];
        this.carGroup.remove(child);
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      }

      const THREE = this.THREE;
      const bodyColor = new THREE.Color(this.car.color || '#222');
      const accentColor = new THREE.Color(this.car.accent || '#dc2626');

      const bodyMat = new THREE.MeshStandardMaterial({
        color: bodyColor,
        metalness: 0.85,
        roughness: 0.25,
        envMapIntensity: 1.2
      });

      const accentMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        metalness: 0.7,
        roughness: 0.3
      });

      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0c,
        metalness: 0.9,
        roughness: 0.05,
        transparent: true,
        opacity: 0.7
      });

      const wheelMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.6,
        roughness: 0.4
      });

      const rimMat = new THREE.MeshStandardMaterial({
        color: 0xa0a0a0,
        metalness: 0.95,
        roughness: 0.15
      });

      const emissiveMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 1.5
      });

      const emissiveAccentMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 1.2
      });

      // === BODY (low aggressive hypercar silhouette) ===
      // Use a custom shape approach with boxes for control
      const bodyGroup = new THREE.Group();

      // Main body: low, wide, tapered
      const mainBodyGeo = new THREE.BoxGeometry(4, 0.4, 1.7);
      const mainBody = new THREE.Mesh(mainBodyGeo, bodyMat);
      mainBody.position.y = 0.45;
      mainBody.castShadow = true;
      bodyGroup.add(mainBody);

      // Front splitter / lower nose
      const frontNoseGeo = new THREE.BoxGeometry(0.6, 0.15, 1.65);
      const frontNose = new THREE.Mesh(frontNoseGeo, bodyMat);
      frontNose.position.set(2.0, 0.25, 0);
      frontNose.castShadow = true;
      bodyGroup.add(frontNose);

      // Front hood (slope down)
      const hoodGeo = new THREE.BoxGeometry(1.3, 0.18, 1.6);
      const hood = new THREE.Mesh(hoodGeo, bodyMat);
      hood.position.set(1.4, 0.55, 0);
      hood.rotation.z = 0.1;
      hood.castShadow = true;
      bodyGroup.add(hood);

      // Cabin (greenhouse)
      const cabinGeo = new THREE.BoxGeometry(1.4, 0.55, 1.4);
      const cabin = new THREE.Mesh(cabinGeo, glassMat);
      cabin.position.set(0, 0.85, 0);
      cabin.castShadow = true;
      bodyGroup.add(cabin);

      // Cabin frame (top arch)
      const roofGeo = new THREE.BoxGeometry(1.0, 0.15, 1.5);
      const roof = new THREE.Mesh(roofGeo, accentMat);
      roof.position.set(0, 1.18, 0);
      bodyGroup.add(roof);

      // Side air intakes
      const intakeGeo = new THREE.BoxGeometry(0.8, 0.25, 0.05);
      const intakeL = new THREE.Mesh(intakeGeo, bodyMat);
      intakeL.position.set(0.1, 0.55, 0.88);
      bodyGroup.add(intakeL);
      const intakeR = intakeL.clone();
      intakeR.position.z = -0.88;
      bodyGroup.add(intakeR);

      // Rear deck / engine cover
      const rearDeckGeo = new THREE.BoxGeometry(1.0, 0.2, 1.7);
      const rearDeck = new THREE.Mesh(rearDeckGeo, bodyMat);
      rearDeck.position.set(-1.4, 0.55, 0);
      rearDeck.castShadow = true;
      bodyGroup.add(rearDeck);

      // Rear bumper
      const rearBumperGeo = new THREE.BoxGeometry(0.4, 0.3, 1.7);
      const rearBumper = new THREE.Mesh(rearBumperGeo, bodyMat);
      rearBumper.position.set(-2.0, 0.45, 0);
      rearBumper.castShadow = true;
      bodyGroup.add(rearBumper);

      // Rear wing supports
      const wingSupGeo = new THREE.BoxGeometry(0.1, 0.5, 0.05);
      const wingSupL = new THREE.Mesh(wingSupGeo, accentMat);
      wingSupL.position.set(-2.0, 0.95, 0.6);
      bodyGroup.add(wingSupL);
      const wingSupR = wingSupL.clone();
      wingSupR.position.z = -0.6;
      bodyGroup.add(wingSupR);

      // Rear wing (horizontal plane)
      const wingGeo = new THREE.BoxGeometry(0.4, 0.04, 1.6);
      const wing = new THREE.Mesh(wingGeo, accentMat);
      wing.position.set(-2.0, 1.2, 0);
      wing.castShadow = true;
      bodyGroup.add(wing);

      // === HEADLIGHTS ===
      const headlightGeo = new THREE.BoxGeometry(0.08, 0.05, 0.4);
      const headlightL = new THREE.Mesh(headlightGeo, emissiveMat);
      headlightL.position.set(2.3, 0.6, 0.5);
      bodyGroup.add(headlightL);
      const headlightR = headlightL.clone();
      headlightR.position.z = -0.5;
      bodyGroup.add(headlightR);

      // === TAILLIGHTS ===
      const taillightGeo = new THREE.BoxGeometry(0.05, 0.05, 1.2);
      const taillight = new THREE.Mesh(taillightGeo, emissiveAccentMat);
      taillight.position.set(-2.21, 0.6, 0);
      bodyGroup.add(taillight);

      // === WHEELS (4) ===
      const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.3, 24);
      const rimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.32, 8);

      const wheelPositions = [
        { x: 1.3, z: 0.95 },
        { x: 1.3, z: -0.95 },
        { x: -1.3, z: 0.95 },
        { x: -1.3, z: -0.95 }
      ];

      wheelPositions.forEach(p => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(p.x, 0.45, p.z);
        wheel.rotation.x = Math.PI / 2;
        wheel.castShadow = true;
        bodyGroup.add(wheel);

        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.position.set(p.x, 0.45, p.z);
        rim.rotation.x = Math.PI / 2;
        bodyGroup.add(rim);
      });

      // === WHEEL ARCHES (subtle, as fender flares) ===
      const archGeo = new THREE.BoxGeometry(1.0, 0.05, 0.2);
      wheelPositions.forEach(p => {
        const arch = new THREE.Mesh(archGeo, bodyMat);
        arch.position.set(p.x, 0.85, p.z);
        bodyGroup.add(arch);
      });

      this.carGroup.add(bodyGroup);
    }

    swapCar(newCar) {
      this.car = newCar;
      this._renderCar();
    }

    setAutoRotate(value) {
      this.options.autoRotate = value;
    }

    _animate() {
      if (this.disposed) return;
      this._animationId = requestAnimationFrame(this._animate);

      const now = performance.now();
      const idleMs = now - this.lastInteraction;
      const isIdle = !this.mouseDown && (now - this.lastInteraction > 1500);

      if (this.options.autoRotate && (isIdle || !this.mouseDown)) {
        if (this.lastInteraction === 0 || isIdle) {
          this.targetRotY += 0.005;
          this.userRotY = this.targetRotY;
        }
      }

      // Smooth damping
      this.carGroup.rotation.y += (this.userRotY - this.carGroup.rotation.y) * 0.08;
      this.carGroup.rotation.x += (this.userRotX - this.carGroup.rotation.x) * 0.08;

      this.renderer.render(this.scene, this.camera);
    }

    _onResize() {
      if (this.disposed) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }

    dispose() {
      this.disposed = true;
      if (this._animationId) cancelAnimationFrame(this._animationId);
      window.removeEventListener('resize', this._onResize);
      if (this.renderer) {
        this.renderer.dispose();
        if (this.renderer.domElement && this.renderer.domElement.parentNode) {
          this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
      }
      if (this.scene) {
        this.scene.traverse(obj => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
          }
        });
      }
      this.running = false;
    }
  }

  global.HypercarShowroom = HypercarShowroom;
})(window);
