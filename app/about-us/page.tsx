import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import BackButton from "@/components/backButton";

import AboutOrg from "./about-org";
import AboutMission from "./about-mission";
import AboutMascot from "./about-mascot";

export default function AboutUs() {
  return (
    <div className="">
      <NavBar />
      <main className="">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <BackButton />
        </div>
        <AboutOrg />
        <AboutMission />
        <AboutMascot />
      </main>
      <Footer />
    </div>
  );
}