<script lang="ts">
  import { Camera, ShaderMaterial } from 'three';
  import { EffectComposer, ShaderPass, RenderPass } from 'postprocessing';
  import { useTask, useThrelte } from '@threlte/core';
  // import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';
  import vertexShader from '$lib/shaders/filmgrain.vert?raw';
  import fragmentShader from '$lib/shaders/filmgrain.frag?raw';

  let amount = 0;
  const { renderer, scene, camera } = useThrelte();
  const composer = new EffectComposer(renderer, {
    alpha: true
  });
  const uniforms = {
    amount: { value: amount },
    tDiffuse: { value: null }
  };

  const setupEffectComposer = (camera: Camera) => {
    composer.removeAllPasses();

    const renderPass = new RenderPass(scene, camera);

    const shaderPass = new ShaderPass(
      new ShaderMaterial({
        transparent: false,
        uniforms,
        vertexShader,
        fragmentShader
      })
    );
    shaderPass.renderToScreen = true;

    // const copyPass = new ShaderPass(new ShaderMaterial(CopyShader));

    composer.addPass(renderPass);
    composer.addPass(shaderPass);
    // composer.addPass(copyPass);
  };

  useTask((delta) => {
    amount += 0.01;
    uniforms.amount.value += amount;

    composer.render(delta);
  });

  $: setupEffectComposer($camera);
</script>
