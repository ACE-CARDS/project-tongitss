"use client";

import React, { useEffect, useState } from "react";
import {
  DayPilot,
  DayPilotMonth,
  DayPilotNavigator,
} from "@daypilot/daypilot-lite-react";
import "./toolbar.css";
import { createClient } from "../lib/supabase/client";

export default function Calendar() {
  const [calendar, setCalendar] = useState<DayPilot.Month>();
  const [datePicker, setDatePicker] = useState<DayPilot.Navigator>();

  const [events, setEvents] = useState<DayPilot.EventData[]>([]);
  const [startDate, setStartDate] = useState<string | DayPilot.Date>(
    "2026-11-01",
  );

  const styles = {
    wrap: {
      display: "flex",
    },
    left: {
      marginRight: "10px",
    },
    main: {
      flexGrow: "1",
    },
  };

  const colors = [
    { name: "Green", id: "#6aa84f" },
    { name: "Blue", id: "#3d85c6" },
    { name: "Turquoise", id: "#00aba9" },
    { name: "Light Blue", id: "#56c5ff" },
    { name: "Yellow", id: "#f1c232" },
    { name: "Orange", id: "#e69138" },
    { name: "Red", id: "#cc4125" },
    { name: "Light Red", id: "#ff0000" },
    { name: "Purple", id: "#af8ee5" },
  ];

  const progressValues = [
    { name: "0%", id: 0 },
    { name: "10%", id: 10 },
    { name: "20%", id: 20 },
    { name: "30%", id: 30 },
    { name: "40%", id: 40 },
    { name: "50%", id: 50 },
    { name: "60%", id: 60 },
    { name: "70%", id: 70 },
    { name: "80%", id: 80 },
    { name: "90%", id: 90 },
    { name: "100%", id: 100 },
  ];

  const editEvent = async (e: DayPilot.Event) => {
    const form = [
      { name: "Event text", id: "text", type: "text" },
      {
        name: "Event color",
        id: "tags.color",
        type: "select",
        options: colors,
      },
      {
        name: "Progress",
        id: "tags.progress",
        type: "select",
        options: progressValues,
      },
    ];

    const modal = await DayPilot.Modal.form(form, e.data);
    if (modal.canceled) {
      return;
    }

    const updatedEvent = modal.result;

    const supabase = createClient();
    const { error } = await supabase
      .from('events')
      .update({
        text: updatedEvent.text,
        color: updatedEvent.tags.color,
        progress: updatedEvent.tags.progress,
      })
      .eq('id', updatedEvent.id);

    if (error) {
      console.error('Error updating event:', error);
      return;
    }

    calendar?.events.update(updatedEvent);
  };

  const contextMenu = new DayPilot.Menu({
    items: [
      {
        text: "Delete",
        onClick: async (args) => {
          const supabase = createClient();
          const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', args.source.id);

          if (error) {
            console.error('Error deleting event:', error);
            return;
          }

          calendar?.events.remove(args.source);
        },
      },
      {
        text: "-",
      },
      {
        text: "Edit...",
        onClick: async (args) => {
          await editEvent(args.source);
        },
      },
    ],
  });

  const onBeforeEventRender = (args: DayPilot.MonthBeforeEventRenderArgs) => {
    const color = (args.data.tags && args.data.tags.color) || "#3d85c6";
    args.data.backColor = color + "cc";

    const progress = args.data.tags?.progress || 0;

    args.data.html = "";

    args.data.areas = [
      {
        id: "text",
        top: 5,
        left: 5,
        right: 5,
        height: 20,
        text: args.data.text,
        fontColor: "#fff",
      },
      {
        id: "progress-text",
        bottom: 5,
        left: 5,
        right: 5,
        height: 40,
        text: progress + "%",
        borderRadius: "5px",
        fontColor: "#000",
        backColor: "#ffffff33",
        style: "text-align: center; line-height: 20px;",
      },
      {
        id: "progress-background",
        bottom: 10,
        left: 10,
        right: 10,
        height: 10,
        borderRadius: "5px",
        backColor: "#ffffff33",
        toolTip: "Progress: " + progress + "%",
      },
      {
        id: "progress-bar",
        bottom: 10,
        left: 10,
        width: `calc((100% - 20px) * ${progress / 100})`,
        height: 10,
        borderRadius: "5px",
        backColor: color,
      },
      {
        id: "menu",
        top: 5,
        right: 5,
        width: 20,
        height: 20,
        symbol: "icons/daypilot.svg#minichevron-down-2",
        fontColor: "#fff",
        backColor: "#00000033",
        style: "border-radius: 25%; cursor: pointer;",
        toolTip: "Show context menu",
        action: "ContextMenu",
      },
    ];
  };

  const onTodayClick = () => {
    datePicker?.select(DayPilot.Date.today());
  };

  useEffect(() => {
    if (!calendar || calendar.disposed()) {
      return;
    }

    const fetchEvents = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('events')
        .select('*');

      if (error) {
        console.error('Error fetching events:', error);
        return;
      }

      const events: DayPilot.EventData[] = data.map(event => ({
        id: event.id,
        text: event.text,
        start: event.start,
        end: event.end,
        tags: {
          color: event.color || "#3d85c6",
          progress: event.progress || 0,
        },
      }));

      setEvents(events);
    };

    fetchEvents();

    datePicker?.select("2026-11-01");
  }, [calendar, datePicker]);

  const onTimeRangeSelected = async (
    args: DayPilot.MonthTimeRangeSelectedArgs,
  ) => {
    const modal = await DayPilot.Modal.prompt("Create a new event:", "Event 1");
    calendar?.clearSelection();
    if (modal.canceled) {
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('events')
      .insert({
        text: modal.result,
        start: args.start.toString(),
        end: args.end.toString(),
        color: "#3d85c6",
        progress: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return;
    }

    calendar?.events.add({
      start: args.start,
      end: args.end,
      id: data.id,
      text: modal.result,
      tags: { color: "#3d85c6", progress: 0 },
    });
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.main}>
        <div className={"toolbar"}>
          <button onClick={onTodayClick}>Today</button>
        </div>
        <DayPilotMonth
          startDate={startDate}
          events={events}
          eventBorderRadius={"5px"}
          eventBarVisible={false}
          eventHeight={80}
          cellHeight={120}
          onTimeRangeSelected={onTimeRangeSelected}
          onEventClick={async (args) => {
            await editEvent(args.e);
          }}
          contextMenu={contextMenu}
          onBeforeEventRender={onBeforeEventRender}
          controlRef={setCalendar}
        />
      </div>
    </div>
  );
}
