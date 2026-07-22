const AnnounceCard = ({ announce_landing }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="mb-3 md:mb-4 rounded-md border border-[#eff0f2] bg-[#bfc4cd]/10 p-3 sm:p-4 md:px-6 md:py-4">
      <p className="text-[#eff0f2] text-xs sm:text-sm opacity-60">
        {formatDate(announce_landing.announce_landing_start)}
      </p>

      <h3 className="pb-1 md:pb-2 text-lg sm:text-xl md:text-2xl font-bold text-[#eff0f2] break-words hyphens-auto leading-tight">
        {announce_landing.announce_landing_title}
      </h3>

      <div className="opacity-85">
        <p className="text-[#eff0f2] text-sm md:text-base text-justify break-words hyphens-auto leading-relaxed">
          {announce_landing.announce_landing_desc}
        </p>
      </div>
    </div>
  );
};

export default AnnounceCard;