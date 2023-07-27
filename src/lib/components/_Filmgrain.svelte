<script lang="ts">
  import { Camera, ShaderMaterial } from 'three';
  import { EffectComposer, ShaderPass, RenderPass } from 'postprocessing';
  import { useFrame, useRender, useThrelte } from '@threlte/core';
  import vertexShader from '$lib/shaders/filmgrain.vert?raw';
  import fragmentShader from '$lib/shaders/filmgrain.frag?raw';

  let amount = 0;
  const { renderer, scene, camera } = useThrelte();
  const composer = new EffectComposer(renderer, {
    alpha: false
  });
  const uniforms = {
    time: { value: 0 },
    amount: { value: amount },
    tDiffuse: { value: null }
  };

  const setupEffectComposer = (camera: Camera) => {
    composer.removeAllPasses();

    const renderPass = new RenderPass(scene, camera);

    const shaderPass = new ShaderPass(
      new ShaderMaterial({
        transparent: true,
        uniforms,
        vertexShader,
        fragmentShader
      }),
    )

    // composer.addPass(new ShaderPass(new ShaderMaterial(CopyShader)));
    composer.addPass(renderPass);
    composer.addPass(shaderPass);
  };

  useFrame(({ renderer }, delta) => {
    amount += 0.01;
    uniforms.amount.value += amount;
  });

  useRender(({ renderer }, delta) => {
    composer.render(delta);
  });

  $: setupEffectComposer($camera);
</script>
