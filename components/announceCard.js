const AnnounceCard = ({ announce_landing }) => {
  return (
    <div className="mb-4 p-4 rounded-4xl border-1 border-[#eff0f2] pr-6 pl-6">
      <h3 className="text-xl font-bold text-[#eff0f2] pb-2">
        {announce_landing.announce_landing_title}
      </h3>
      <div className="opacity-85">
        <p className="text-[#eff0f2] text-justify ">
          {announce_landing.announce_landing_desc}
        </p>
      </div>
    </div>
  );
};

export default AnnounceCard;
