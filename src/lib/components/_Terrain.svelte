<script lang="ts">
  import { Color, Mesh, OrthographicCamera, Vector3 } from 'three';
  import { T, useFrame, useRender, useThrelte } from '@threlte/core';
  import vertexShader from '$lib/shaders/terrain.vert?raw';
  import fragmentShader from '$lib/shaders/terrain.frag?raw';
  import { getContext, onMount } from 'svelte';
  import { DARK } from '$lib/utils/const';
  import type { Writable } from 'svelte/store';

  // Line colors
  const topoColorValOnDark = new Color(38 / 255, 38 / 255, 38 / 255);
  const topoColorValOnLight = new Color(231 / 255, 231 / 255, 231 / 255);
  const highlightColorValOnDark = new Color(56 / 255, 56 / 255, 56 / 255);
  const highlightColorValOnLight = new Color(255 / 255, 255 / 255, 255 / 255);

  const f = 3.3;
  const t = 2.7;
  let d = 0;
  let u = t;
  let mesh: Mesh;
  let rotationZ = 0.9;

  const DEG2RAD = Math.PI / 180;
  const { camera } = useThrelte() as unknown as { camera: Writable<OrthographicCamera> };

  onMount(() => {
    mesh.rotation.x = 45 * DEG2RAD;
    mesh.rotation.z = 45 * DEG2RAD;
    $camera.lookAt(mesh.position);
  });

  useFrame(({ renderer }, delta) => {
    mesh.rotation.z += -0.0002;
    mesh.rotation.z += (window.scrollY - d) * 0.0002;

    uniforms.scroll.value = t + (window.scrollY / document.body.scrollHeight) * (f - t);
    u += uniforms.speed.value * 0.15;
    u += (window.scrollY - d) * 0.0001;
    const n = (Math.PI * (u - t)) / (f - t);
    uniforms.time.value = t + (f - t) * Math.sin(n);
    uniforms.topoColor.value = topoColorVal;
    uniforms.highlightColor.value = highlightColorVal;
    d = window.scrollY;
  });

  // Theme mode (dark/light)
  const { mediaMode }: any = getContext('theme');

  $: topoColorVal = $mediaMode === DARK ? topoColorValOnDark : topoColorValOnLight;
  $: highlightColorVal = $mediaMode === DARK ? highlightColorValOnDark : highlightColorValOnLight;
  $: uniforms = {
    time: { value: t },
    speed: { value: 0.002 },
    scroll: { value: 0.002 },
    waveDefinition: { value: 1.4 },
    waveAmplitude: { value: 0.5 },
    topoDefinition: { value: 70 },
    topoColor: { value: new Color(228 / 255, 228 / 255, 228 / 255) },
    highlightColor: { value: new Color(228 / 255, 228 / 255, 228 / 255) }
  };

  // const noise = createNoise2D();
  // const verticies = geometry.getAttribute('position').array;
  // const newVerticies = new Float32Array(verticies.length);

  // for (let i = 0; i < verticies.length; i += 3) {
  // 	const x = verticies[i];
  // 	const y = verticies[i + 1];

  // 	newVerticies[i] = x;
  // 	newVerticies[i + 1] = y;
  // 	newVerticies[i + 2] = noise(x / 4, y / 4);
  // }
  // const bufferAttr = new BufferAttribute(newVerticies, 3);
  // geometry.setAttribute('position', bufferAttr);
</script>

<T.Mesh bind:ref={mesh} position={[50, -300, 200]}>
  <T.PlaneGeometry args={[5, 5, 800, 800]} />
  <T.ShaderMaterial transparent side={2} {vertexShader} {fragmentShader} {uniforms} />
</T.Mesh>
