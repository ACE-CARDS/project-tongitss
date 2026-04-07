"use client";

import React, { useState, useEffect } from "react";
import { DayPilot, DayPilotMonth } from "@daypilot/daypilot-lite-react";
import { createClient } from "@/lib/supabase/client";
import "./toolbar.css";
import CalendarEvent from "./calendarEvent";
import Image from "next/image";

const supabase = createClient();

export default function Calendar() {
  const [cellHeight, setCellHeight] = useState(100);

  useEffect(() => {
    const handleResize = () => {
      setCellHeight(window.innerWidth < 768 ? 60 : 100);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [events, setEvents] = useState<any[]>([]);
  const [startDate, setStartDate] = useState(
    DayPilot.Date.today().firstDayOfMonth(),
  );
  const [calendar, setCalendar] = useState<DayPilot.Month>();

  const prevMonth = () => {
    setStartDate(startDate.addMonths(-1));
  };
  const nextMonth = () => {
    setStartDate(startDate.addMonths(1));
  };
  const goToToday = () => {
    setStartDate(DayPilot.Date.today().firstDayOfMonth());
  };

  useEffect(() => {
    async function getEvents() {
      const { data, error } = await supabase
        .from("event")
        .select("*")
        .eq("is_active", true);

      if (error) {
        console.error("Error fetching events:", error);
      } else {
        const listEvents = data.map((item) => ({
          id: item.id,
          text: item.event_name,
          start: item.event_start,
          end: new DayPilot.Date(item.event_end).addDays(1),
          data: item,
        }));
        setEvents(listEvents);
      }
    }

    getEvents();
  }, []);

  const styles = {
    wrap: {
      padding: "0px",
    },
    main: {
      flexGrow: "1",
    },
  };

  const [isPopupShowing, setIsPopupShowing] = useState(false);
  const [selectedEventData, setSelectedEventData] = useState<any>(null);

  return (
    <div style={styles.wrap}>
      <div>
        {/*Toolbar*/}
        <div className="toolbar mb-4 flex flex-col items-center justify-between gap-4 md:gap-0 md:flex-row">
          <h2 className="text-2xl font-bold text-center md:text-left md:text-xl">
            {startDate.toString("MMMM yyyy")}
          </h2>

          <div className="flex w-full justify-center md:justify-end gap-1 md:w-auto">
            <button
              onClick={prevMonth}
              className="btn-primary flex-1 md:flex-none"
            >
              <Image
                src="/left-arrow.svg"
                alt="Previous Month"
                width={20}
                height={20}
                className="mx-auto"
              />
            </button>
            <button
              onClick={goToToday}
              className="btn-primary flex-1 md:flex-none"
            >
              <Image
                src="/current.svg"
                alt="Current Month"
                width={20}
                height={20}
                className="mx-auto"
              />
            </button>
            <button
              onClick={nextMonth}
              className="btn-primary flex-1 md:flex-none"
            >
              <Image
                src="/right-arrow.svg"
                alt="Next Month"
                width={20}
                height={20}
                className="mx-auto"
              />
            </button>
          </div>
        </div>

        {/*calendar*/}
        <div style={styles.main} className="calendar">
          <DayPilotMonth
            startDate={startDate}
            events={events}
            timeRangeSelectedHandling="Disabled"
            eventMoveHandling="Disabled" // Disables drag and drop
            eventResizeHandling="Disabled"
            onEventClick={(args) => {
              setSelectedEventData(args.e.data.data);
              setIsPopupShowing(true);
            }}
            onBeforeEventRender={(args) => {}}
          />

          {/*Calendar Modal mhm*/}
          <CalendarEvent
            isShowing={isPopupShowing}
            onClose={() => setIsPopupShowing(false)}
            eventDetail={selectedEventData}
          />
        </div>
      </div>
    </div>
  );
}
