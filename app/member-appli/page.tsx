import NavBar from "@/components/navbar";
import Footer from "@/components/footer";

import ApplicationHero from "./application-hero";
import ApplicationInfo from "./application-info";
import ApplicationTestimony from "./application-testimony";
import BackButton from "@/components/backButton";

export default function MemberApplication() {
  return (
    <div className="">
      <NavBar />
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <BackButton />
      </div>
      <main className="bg-white">
        <ApplicationHero />
        <ApplicationInfo />
        <ApplicationTestimony />
      </main>
      <Footer />
    </div>
  );
}
