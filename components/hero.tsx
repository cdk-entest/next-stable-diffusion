import Image from "next/image";

const Hero = () => {
  return (
    <div className="relative h-80 dark:bg-slate-800 flex items-center justify-center">
      <img
        src="https://d2cvlmmg8c0xrp.cloudfront.net/pirf/bird.jpg"
        className="absolute w-full h-full object-cover opacity-30"
      ></img>

      {/* <Image
        src={"https://d2cvlmmg8c0xrp.cloudfront.net/pirf/singapore.jpg"}
        className="w-full h-full object-cover opacity-30 absolute"
        width={300}
        height={300}
        alt="background"
        priority
        placeholder={"empty"}
      ></Image> */}

      <h1 className="dark:text-white font-mplus font-semibold text-3xl z-10">
        English Speaking with PIRF
      </h1>
    </div>
  );
};

export default Hero;
