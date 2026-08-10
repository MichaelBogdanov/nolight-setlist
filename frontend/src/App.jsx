import "./App.css";
// import LightRays from "./components/LightRays";
import Particles from './components/Particles';
import Flowers from "./components/Flowers";
import Setlist from "./components/Setlist";
import Logo from "./components/Logo";
import Flashlight from "./components/Flashlight";

function App() {
    return (
        <>
          {/* <LightRays
            raysOrigin="top-center"
            raysColor="#F39A0E"
            raysSpeed={1}
            lightSpread={0.5}
            rayLength={3}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0}
            distortion={0}
            className="custom-rays"
            pulsating={false}
            fadeDistance={1}
            saturation={1}
          /> */}
          <div>
            <Flowers />
            <Particles
              particleColors={["#ffffff"]}
              particleCount={150}
              particleSpread={10}
              speed={0.05}
              particleBaseSize={100}
              moveParticlesOnHover
              alphaParticles={false}
              disableRotation={false}
              pixelRatio={1}
            />
          </div>
          <main>
            <Logo />
            <Setlist />
          </main>
          <Flashlight />
        </>
    );
}

export default App;

