import ActionArea from "@/components/ActionArea/ActionArea";

import HomeSection from "@/components/HomeSection/HomeSection";
import Navbar from "@/components/Navbar";

const page = () => {
  return (
    <div className="overflow-hidden">
      <Navbar />
      <div className="float-in  ">
        <HomeSection />
      </div>
      <div className="float-in float-in-action">
        <ActionArea />
      </div>
    </div>
  );
};

export default page;
