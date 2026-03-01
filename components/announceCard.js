const AnnounceCard = ({ announce_landing }) => {
  return (
    <div className="mb-4 border-b border-white/10 pb-4">
      <h3 className="text-lg font-bold text-green-400">
        {announce_landing.announce_landing_title}
      </h3>
      <p className="text-gray-200">{announce_landing.announce_landing_desc}</p>
    </div>
  );
};

export default AnnounceCard;
