import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { type FC, useRef, useEffect, useState } from "react";
import { Transition } from "react-transition-group";
import { createClient } from "@/utils/supabase/client";

type Props = {
  isShowing: boolean;
  onClose: () => void;
};

gsap.registerPlugin(useGSAP);

const Modal: FC<Props> = ({ isShowing, onClose }) => {
  const [announce_landing, setAnnouncement] = useState({
    announce_landing_title: "Loading...",
    announce_landing_desc: "",
  });
  const supabase = createClient();

  useEffect(() => {
    async function getAnnouncement() {
      const { data, error } = await supabase
        .from("announce_landing")
        .select("announce_landing_title, announce_landing_desc")
        .single();

      if (data) {
        setAnnouncement(data);
      }
    }

    if (isShowing) {
      getAnnouncement();
    }
  }, [isShowing, supabase]);

  const container = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: container });

  const onEnter = contextSafe(() => {
    gsap
      .timeline()
      .to(".backdrop", { opacity: 1, duration: 0.1 })
      .fromTo(
        ".content",
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.1 },
        0,
      )
      .fromTo(
        "h2, p",
        { opacity: 0, y: 3 },
        { opacity: 1, y: 0, duration: 0.1, stagger: 0.01 },
        "-=0.2",
      );
  });

  const onExit = contextSafe(() => {
    gsap.to(".backdrop", { opacity: 0, duration: 0.2 });
    gsap.to(".content", { opacity: 0, scale: 0.95, duration: 0.2 });
  });

  return (
    <Transition
      in={isShowing}
      timeout={{ exit: 300 }}
      mountOnEnter
      unmountOnExit
      onEnter={onEnter}
      onExit={onExit}
      nodeRef={container}
    >
      {(status) => (
        <div
          ref={container}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="backdrop absolute inset-0 cursor-pointer bg-black/20 opacity-0 backdrop-blur-md"
            onClick={onClose}
          />
          <div className="content relative h-[80%] w-[80%] space-y-4 rounded-3xl border border-black bg-[#011638] p-8 text-white shadow-2xl flex flex-col">
            <div>
              <h2 className="text-xl font-bold text-green text-center">
                ANNOUNCEMENT
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar">
              <p>{announce_landing.announce_landing_title}</p>
              <p>{announce_landing.announce_landing_desc}</p>
              <p>
                More than 100 stealth egg attacks baffle one Euclid homeowner
                and police (photos and video) EUCLID, Ohio -- An 85-year-old
                Euclid man's home has become the target of mysterious egging
                attacks that began in March 2014 and haven't stopped. The
                continuous onslaught of eggs has baffled police, neighbors and
                local government officials who have tried and failed to identify
                the source of the attacks that have ruined the man's home and
                kept his family on edge. "The accuracy is phenomenal," Albert
                Clemens, Sr. said. "Because almost every time when it's nice
                weather and they launch five or six of these at a time, they
                almost invariably hit the front door." Clemens green two-story
                house sits on the corner of Wilmore Avenue and East 210th
                Street. He and his wife bought the home as newlyweds about 60
                years ago. Though his wife has since passed away, Clemens still
                lives there with his 49-year-old daughter and 51-year-old son.
                The house has been pelted with eggs several times a week --
                sometimes more than once a day -- for the past year. The attacks
                always happen after dark and last around 10 minutes each. The
                family has been awoken as late as 2 a.m. by what sounds like the
                crack of a gunshot against the aluminum siding or front door.
                Clemens and police believe the eggs are being launched from a
                block or two away. The siding on the front of Clemens' home is
                destroyed, splattered with dried egg residue that stripped off
                the paint. Other than a few rogue eggs that hit nearby homes, no
                other neighbors have been targeted. "Somebody is deeply, deeply
                angry at somebody in that household for some reason," Euclid Lt.
                Mitch Houser said. Winter offered a short respite for the
                family, as the egging became less frequent during the cold
                weather. But both Clemens and police anticipate the attacks
                picking back up as the snow and ice thaw. An unsolved mystery
                Euclid police have not taken the investigation lightly. They've
                spent a year doing undercover stakeouts, canvassing the
                neighborhood and even sending eggshells for testing. The
                department's entire community policing unit was dedicated to
                tracking down the eggers at one point. Officers respond quickly
                to every egging call at the home -- which is less than a mile
                from the police station. Both Clemens and detectives are at a
                dead end when it comes to suspects. Clemens had suspicions about
                a young man across the street who confronted him a couple years
                ago and asked him to stop calling police about suspicious
                activity in the neighborhood. Clemens said that he had started
                calling police more often as he noticed more crime -- mostly
                suspected drug activity. Another neighbor Clemens suspected was
                ruled out when officers saw him standing outside as an attack
                occurred in the presence of police. Investigators have taken
                several different approaches to nabbing the eggers, including
                installing a surveillance camera on the house. Detectives even
                collected some eggshell samples and tested them in a crime lab.
                The eggs were traced back to a local Amish farm, but the trail
                ended there. Clemens says the culprits either have access to a
                large supply of eggs or are stealing them from businesses that
                throw them out when they go bad. Detectives have followed this
                thread, visiting local restaurants and businesses asking about
                missing eggs. They've also tried collecting fingerprints from
                eggshells, but Houser said that's an impossible task. When an
                egg breaks, it releases proteins that destroy DNA. Officers have
                gone door to door questioning neighbors and handing out fliers.
                Nobody has come forward with any tips. "The person or people who
                are doing it have remained very tight-lipped apparently," Houser
                said. "I would imagine it would be hard{" "}
              </p>
            </div>
          </div>
        </div>
      )}
    </Transition>
  );
};

export default Modal;
