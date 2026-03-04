import NavBar from "@/components/navbar";
import Footer from "@/components/footer";

import ApplicationHero from "./application-hero";
import ApplicationInfo from "./application-info";
import ApplicationTestimony from "./application-testimony";

export default function MemberApplication() {
  return (
    <div className="">
      <NavBar />
      <main className="bg-white">
        <ApplicationHero />
        <ApplicationInfo />
        <ApplicationTestimony />
      </main>
      <Footer />
    </div>
  );
}