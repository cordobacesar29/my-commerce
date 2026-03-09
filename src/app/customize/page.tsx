'use client';
import { motion, AnimatePresence } from "framer-motion";
import { useSnapshot } from "valtio";
import {
  headContainerAnimation,
  headContentAnimation,
  headTextAnimation,
  slideAnimation,
} from "../../config/motion";
import { CustomButton } from "../../components";
import Canvas from "../../canvas"
// import Customizer from "../Customizer"

import state from "../../store";
const Home = () => {
  const snap = useSnapshot(state);

  return (
    <main className="relative w-full h-screen overflow-hidden transition-all ease-in ">
      <AnimatePresence>
        {snap.intro && (
          <motion.section className="w-fit xl:h-full flex xl:justify-between justify-start items-start flex-col xl:py-8 xl:px-36 sm:p-8 p-6 max-xl:gap-7 absolute z-10" {...slideAnimation("left")}>
            <motion.header {...slideAnimation("down")}>
              <img
                src="./ramon_logo.svg"
                alt="logo"
                className="w-24 h-24 object-contain"
                width={48}
                height={48}
              />
            </motion.header>
            <motion.div className="flex-1 xl:justify-center justify-start flex flex-col gap-10" {...headContainerAnimation}>
              <motion.div {...headTextAnimation}>
                <h1 className="xl:text-[10rem] text-[6rem] xl:leading-[11rem] leading-[7rem] font-black text-red-600">
                  Ra <br /> Mónsss
                </h1>
              </motion.div>
              <motion.div {...headContentAnimation} className="flex flex-col gap-5">
                <p className="max-w-md font-normal text-gray-300 text-base">
                  Creá tu remera única y exclusiva con nuestra nueva herramienta de personalización 3D. Da rienda suelta a tu imaginación y definí tu propio estilo. 
                </p>

                <CustomButton
                  type="filled"
                  title="Customize It"
                  handleClick={() => (state.intro = false)}
                  customStyles="w-fit px-4 py-2.5 font-bold text-sm"
                />
              </motion.div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
      <Canvas/>
      {/* <Customizer/> */}
    </main>
  );
};

export default Home;
