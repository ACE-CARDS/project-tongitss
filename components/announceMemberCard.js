const AnnounceMemberCard = ({ announce_dash }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const isSame =
    announce_dash.announce_dash_start === announce_dash.announce_dash_end;
  return (
    <div className="ml-4 mb-4 p-4 rounded-xl border-1 border-[#d7d7d7] pr-6 pl-6 bg-white">
      <p className="text-[#141414] text-justify text-xs opacity-60">
        {formatDate(announce_dash.announce_dash_start)}
        {!isSame && ` - ${formatDate(announce_dash.announce_dash_end)}`}
      </p>
      <h3 className="text-l font-bold text-[#141414] pb-2 pt-2">
        {announce_dash.announce_dash_title}
      </h3>
      <div className="opacity-85">
        <p className="text-[#141414] text-justify text-sm">
          {announce_dash.announce_dash_desc}
        </p>
      </div>
    </div>
  );
};

export default AnnounceMemberCard;
