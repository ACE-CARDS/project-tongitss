import NavBar from "@/components/navbar";
import Footer from "@/components/footer";

import AboutOrg from "./about-org";
import AboutMission from "./about-mission";
import AboutMascot from "./about-mascot";

export default function AboutUs() {
  return (
    <div className="">
      <NavBar />
      <main className="">
        <AboutOrg />
        <AboutMission />
        <AboutMascot />
      </main>
      <Footer />
    </div>
  );
}