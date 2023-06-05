import { Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import { useCallback, useState } from "react";
import confettiFountain from "@/features/animations/particles-configs/confetti-fountain";
import Particles from "react-particles";

const ConfettiBackground = () => {
  let [options, setOptions] = useState<any>(confettiFountain);

  const particlesInit = useCallback(async (engine: Engine) => {
    // console.log(engine);
    // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: any) => {
    // await console.log(container);
    // setInterval(() => updateDirection(), 3000);
  }, []);
  return (
    <Particles
      init={particlesInit}
      loaded={particlesLoaded}
      // @ts-ignore
      options={options}
    />
  );
};

export default ConfettiBackground;
