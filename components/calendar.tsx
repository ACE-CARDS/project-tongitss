"use client";

import React, { useState, useEffect, useRef } from "react";
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

  const yearLabels = () => {
    const startYear = 2022;
    const endYear = new Date().getFullYear() + 50;
    const options = [];
    for (let y = startYear; y <= endYear; y++) {
      options.push({ label: y.toString(), value: y });
    }
    return options;
  };

  const handleYearChange = (year: number) => {
    const newDate = moment(currentDate).year(year).toDate();
    setCurrentDate(newDate);
  };

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

  const YearDropdown = ({ value, options, onChange }: any) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node))
          setOpen(false);
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
      if (open && listRef.current) {
        const currentItem = listRef.current.querySelector(
          `[data-value="${value}"]`,
        );
        if (currentItem) {
          currentItem.scrollIntoView({ block: "center" });
        }
      }
    }, [open, value]);

    const selectedLabel = value.toString();

    return (
      <div ref={ref} className="relative z-[100] font-sans">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="bg-white/70 backdrop-blur-xl px-4 py-1.5 border border-[#011638] rounded-xl text-[#011638] font-bold shadow-sm 
          hover:shadow-md transition flex items-center gap-2"
        >
          {selectedLabel}
          <svg
            className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {open && (
          <div className="absolute left-0 mt-2 w-32 bg-white border rounded-xl shadow-lg border-[#011638] overflow-hidden">
            <ul className="py-1 max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((o: any) => (
                <li
                  key={o.value}
                  data-value={o.value}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`px-4 py-2 cursor-pointer transition-colors text-sm font-medium
                  ${o.value === value ? "bg-[#011638] text-white" : "hover:bg-gray-100 text-gray-700"}
                `}
                >
                  {o.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-[550px] md:min-h-[750px] p-0">
      {/*Toolbar Start*/}
      <div className="rounded-xl toolbar mb-4 flex flex-col items-center justify-between gap-4 md:gap-0 md:flex-row  ">
        <div className="flex items-center gap-2 md:gap-2">
          <YearDropdown
            value={moment(currentDate).year()}
            options={yearLabels()}
            onChange={handleYearChange}
          />
          <h2 className="text-3xl font-bold text-[#011638] md:text-2xl">
            {moment(currentDate).format("MMMM")}
          </h2>
        </div>

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
      {/*Toolbar End*/}

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
