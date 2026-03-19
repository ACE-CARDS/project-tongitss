import NavBar from "@/components/navbar";
import Footer from "@/components/footer";

import EventsTimeline from "./events-timeline";

export default function EventsPage() {
  return (
    <div className="">
      <NavBar />
      
      <main>
        <EventsTimeline />
      </main>
      <Footer />
    </div>
  );
}