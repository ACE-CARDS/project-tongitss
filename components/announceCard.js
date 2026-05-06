const AnnounceCard = ({ announce_landing }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const isSame =
    announce_landing.announce_landing_start ===
    announce_landing.announce_landing_end;

  return (
    <div className="mb-4 p-4 rounded-md border border-[#eff0f2] pr-6 pl-6 bg-[#bfc4cd]/10">
      <p className="text-[#eff0f2] text-justify text-sm opacity-60">
        {formatDate(announce_landing.announce_landing_start)}
        {!isSame && ` - ${formatDate(announce_landing.announce_landing_end)}`}
      </p>

      <h3 className="text-2xl font-bold text-[#eff0f2] pb-2 hyphens-auto break-words">
        {announce_landing.announce_landing_title}
      </h3>
      <div className="opacity-85">
        <p className="text-[#eff0f2] text-justify hyphens-auto break-words">
          {announce_landing.announce_landing_desc}
        </p>
      </div>
    </div>
  );
};

export default AnnounceCard;
