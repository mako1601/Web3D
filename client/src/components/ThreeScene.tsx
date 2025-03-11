import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "lil-gui";
import { TeapotGeometry } from "three/examples/jsm/geometries/TeapotGeometry.js";

export default function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [_gui, setGui] = useState<GUI | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 80000);
    camera.position.set(-200, 300, 500);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x7c7c7c, 2.0);
    const light = new THREE.DirectionalLight(0xffffff, 2.0);
    light.position.set(0.32, 0.39, 0.7);
    scene.add(ambientLight, light);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener("change", renderScene);

    const textureMap = new THREE.TextureLoader().load("textures/uv_grid_opengl.jpg");
    textureMap.wrapS = textureMap.wrapT = THREE.RepeatWrapping;
    textureMap.anisotropy = 16;

    const cubemapOptions: Record<string, string> = {
      bridge: 'textures/cubemap/bridge/',
      night_sky: 'textures/cubemap/night sky/'
    };
    let currentCubemap = "bridge";
    const urls = ['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'];
    let textureCube = new THREE.CubeTextureLoader().setPath(cubemapOptions[currentCubemap]).load(urls);

    const materials = {
      wireframe: new THREE.MeshBasicMaterial({ wireframe: true }),
      flat: new THREE.MeshPhongMaterial({ specular: 0x000000, flatShading: true, side: THREE.DoubleSide }),
      smooth: new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }),
      glossy: new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        metalness: 0.5,
        roughness: 0.5,
        emissive: 0x000000,
        emissiveIntensity: 0.0,
        side: THREE.DoubleSide
      }),
      textured: new THREE.MeshPhongMaterial({ map: textureMap, side: THREE.DoubleSide }),
      reflective: new THREE.MeshPhongMaterial({ envMap: textureCube, side: THREE.DoubleSide }),
    };

    const effectController = {
      newTess: 15,
      newShading: "glossy",
      cubemapType: currentCubemap,
      opacity: 1.0,
      emissiveColor: "#000000",
      emissiveIntensity: 0.0,
      lightIntensity: 2.0,
      lightColor: "#ffffff",
      cameraFov: 45,
      metalness: 0.5,
      roughness: 0.5,
      textureScale: 1.0,
      rotationSpeed: 0,
      shadowRadius: 4,
      shadowBias: -0.0001,
      enableShadows: true,
    };

    let teapot: THREE.Mesh;

    function createNewTeapot(randomRotation = false) {
      if (teapot) {
        teapot.geometry.dispose();
        scene.remove(teapot);
      }
      const geometry = new TeapotGeometry(100, effectController.newTess);
      if (effectController.newShading === "reflective") {
        materials.reflective.envMap = textureCube;
      }
      teapot = new THREE.Mesh(geometry, materials[effectController.newShading as keyof typeof materials]);
      scene.add(teapot);
      if (randomRotation) {
        teapot.rotation.set(
          Math.random() * Math.PI * 2 - Math.PI,
          Math.random() * Math.PI * 2 - Math.PI,
          Math.random() * Math.PI * 2 - Math.PI
        );
      }
      renderScene();
    }

    function updateCubemap() {
      new THREE.CubeTextureLoader()
        .setPath(cubemapOptions[effectController.cubemapType])
        .load(urls, (textureCubeLoaded) => {
          textureCube = textureCubeLoaded;
          materials.reflective.envMap = textureCube;
          if (effectController.newShading === "reflective") {
            scene.background = textureCube;
          }
          createNewTeapot();
          renderScene();
        });
    }

    const guiInstance = new GUI();

    guiInstance.add(effectController, "newTess", [2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 40, 50])
      .name("Tessellation Level").onChange(() => createNewTeapot(false));

    guiInstance.add(effectController, "newShading", Object.keys(materials))
      .name("Shading").onChange(() => {
        createNewTeapot();
        handleShadingChange();
      });

    const cubemapController = guiInstance.add(effectController, "cubemapType", Object.keys(cubemapOptions))
      .name("Cubemap Type").onChange(updateCubemap);

    const metalnessController = guiInstance.add(effectController, "metalness", 0, 1, 0.01).name("Metalness").onChange(() => {
      if (materials.glossy instanceof THREE.MeshStandardMaterial) {
        materials.glossy.metalness = effectController.metalness;
        renderScene();
      }
    });

    const roughnessController = guiInstance.add(effectController, "roughness", 0, 1, 0.01).name("Roughness").onChange(() => {
      if (materials.glossy instanceof THREE.MeshStandardMaterial) {
        materials.glossy.roughness = effectController.roughness;
        renderScene();
      }
    });

    const emissiveColorController = guiInstance.addColor(effectController, "emissiveColor").name("Emissive Color").onChange(() => {
      if (materials.glossy instanceof THREE.MeshStandardMaterial) {
        materials.glossy.emissive.set(effectController.emissiveColor);
        renderScene();
      }
    });

    const emissiveIntensityController = guiInstance.add(effectController, "emissiveIntensity", 0, 1, 0.01).name("Emissive Intensity").onChange(() => {
      if (materials.glossy instanceof THREE.MeshStandardMaterial) {
        materials.glossy.emissiveIntensity = effectController.emissiveIntensity;
        renderScene();
      }
    });

    const opacityController = guiInstance.add(effectController, "opacity", 0, 1, 0.01).name("Opacity").onChange(() => {
      materials.glossy.transparent = true;
      materials.glossy.opacity = effectController.opacity;
      renderScene();
    });

    const lightIntensityController = guiInstance.add(effectController, "lightIntensity", 0, 5, 0.1).name("Main Light Intensity").onChange(() => {
      light.intensity = effectController.lightIntensity;
      renderScene();
    });

    const lightColorController = guiInstance.addColor(effectController, "lightColor").name("Main Light Color").onChange(() => {
      light.color.set(effectController.lightColor);
      renderScene();
    });

    const textureScaleController = guiInstance.add(effectController, "textureScale", 0.1, 5, 0.1).name("Texture Scale").onChange(() => {
      textureMap.repeat.set(effectController.textureScale, effectController.textureScale);
      textureMap.needsUpdate = true;
      renderScene();
    });

    type ShadingType = 'wireframe' | 'flat' | 'smooth' | 'glossy' | 'textured' | 'reflective';
    function handleShadingChange() {
      const controllers = {
        wireframe: {
          hide: [opacityController, lightIntensityController, lightColorController, textureScaleController, cubemapController, metalnessController, roughnessController, emissiveColorController, emissiveIntensityController],
          show: []
        },
        flat: {
          hide: [cubemapController, metalnessController, roughnessController, emissiveColorController, emissiveIntensityController, opacityController, textureScaleController],
          show: [lightIntensityController, lightColorController]
        },
        smooth: {
          hide: [cubemapController, metalnessController, roughnessController, emissiveColorController, emissiveIntensityController, opacityController, textureScaleController],
          show: [lightIntensityController, lightColorController]
        },
        glossy: {
          hide: [cubemapController, textureScaleController],
          show: [metalnessController, roughnessController, emissiveColorController, emissiveIntensityController, opacityController]
        },
        textured: {
          hide: [cubemapController, metalnessController, roughnessController, emissiveColorController, emissiveIntensityController, opacityController],
          show: [lightIntensityController, lightColorController, textureScaleController]
        },
        reflective: {
          hide: [metalnessController, roughnessController, emissiveColorController, emissiveIntensityController, textureScaleController],
          show: [cubemapController]
        }
      };
      const currentShading = effectController.newShading as ShadingType;
      if (controllers[currentShading]) {
        controllers[currentShading].hide.forEach(controller => controller.hide());
        controllers[currentShading].show.forEach(controller => controller.show());
      }
    }

    guiInstance.add(effectController, "cameraFov", 10, 120, 1).name("Camera FOV").onChange(() => {
      camera.fov = effectController.cameraFov;
      camera.updateProjectionMatrix();
      renderScene();
    });
    guiInstance.add(effectController, "rotationSpeed", 0, 0.1, 0.001).name("Rotation Speed");
    guiInstance.add({ randomRotation: () => createNewTeapot(true) }, "randomRotation").name("Random Rotation");

    function animate() {
      requestAnimationFrame(animate);
      if (teapot) teapot.rotation.y += effectController.rotationSpeed;
      renderScene();
    }
    animate();

    setGui(guiInstance);

    createNewTeapot();
    handleShadingChange();

    function onResize() {
      const newWidth = containerRef.current?.clientWidth || width;
      const newHeight = containerRef.current?.clientHeight || height;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      renderScene();
    }
    window.addEventListener("resize", onResize);

    function renderScene() {
      if (effectController.newShading === "reflective") {
        scene.background = textureCube;
      } else {
        scene.background = new THREE.Color(0x555555);
      }
      renderer.render(scene, camera);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      guiInstance.destroy();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
}