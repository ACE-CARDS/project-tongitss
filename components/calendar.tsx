"use client";

import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { createClient } from "@/lib/supabase/client";
import CalendarEvent from "./calendarEvent";
import Image from "next/image";
import ShowMoreEventsModal from "./showMoreEventsModal";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./toolbar.css";

const supabase = createClient();
const localizer = momentLocalizer(moment);

export default function BigCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPopupShowing, setIsPopupShowing] = useState(false);
  const [selectedEventData, setSelectedEventData] = useState<any>(null);

  const [isMorePopupOpen, setIsMorePopupOpen] = useState(false);
  const [moreEventsData, setMoreEventsData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleShowMore = (events: any[], date: Date) => {
    setMoreEventsData(events);
    setSelectedDate(date);
    setIsMorePopupOpen(true);
  };

  const handleSelectFromMore = (event: any) => {
    setIsMorePopupOpen(false);
    setSelectedEventData(event.resource || event);
    setIsPopupShowing(true);
  };

  useEffect(() => {
    async function getEvents() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_deleted", false);

      if (error) {
        console.error("Error fetching events:", error);
      } else {
        const listEvents = data.map((item) => ({
          id: item.id,
          title: item.short_title || item.title,
          start: new Date(item.start_date),
          end: new Date(item.end_date),
          resource: item,
        }));
        setEvents(listEvents);
      }
    }
    getEvents();
  }, []);

  const prevMonth = () => {
    setCurrentDate(moment(currentDate).subtract(1, "month").toDate());
  };
  const nextMonth = () => {
    setCurrentDate(moment(currentDate).add(1, "month").toDate());
  };
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="flex flex-col h-full min-h-[550px] md:min-h-[750px] p-0">
      {/*Toolbar*/}
      <div className="rounded-xl toolbar mb-4 flex flex-col items-center justify-between gap-4 md:gap-0 md:flex-row  ">
        <h2 className="text-2xl font-bold text-center md:text-left md:text-xl">
          {moment(currentDate).format("MMMM yyyy")}
        </h2>

        <div className="flex w-full justify-center md:justify-end gap-1 md:w-auto ">
          <button
            onClick={prevMonth}
            className="btn-primary flex-1 md:flex-none"
          >
            <Image
              src="/left-arrow.svg"
              alt="Prev"
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
              alt="Today"
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
              alt="Next"
              width={20}
              height={20}
              className="mx-auto"
            />
          </button>
        </div>
      </div>

      {/*calendar*/}
      <div className="h-full min-h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          date={currentDate}
          view="month"
          toolbar={false}
          popup={false}
          onShowMore={handleShowMore}
          onSelectEvent={(event) => {
            setSelectedEventData(event.resource);
            setIsPopupShowing(true);
          }}
        />

        {/*show more events*/}
        <ShowMoreEventsModal
          isShowing={isMorePopupOpen}
          events={moreEventsData}
          date={selectedDate}
          onClose={() => setIsMorePopupOpen(false)}
          onEventClick={handleSelectFromMore}
        />

        {/*Calendar Modal mhm*/}
        <CalendarEvent
          isShowing={isPopupShowing}
          onClose={() => setIsPopupShowing(false)}
          eventDetail={selectedEventData}
        />
      </div>
    </div>
  );
}
