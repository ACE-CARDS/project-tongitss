const AnnounceMemberCard = ({ announce_dash }) => {
  return (
    <div className="ml-4 mb-4 p-4 rounded-xl border-1 border-[#d7d7d7] pr-6 pl-6">
      <h3 className="text-l font-bold text-[black] pb-2">
        {announce_dash.announce_dash_title}
      </h3>
      <div className="opacity-85">
        <p className="text-[black] text-justify text-sm">
          {announce_dash.announce_dash_desc}
        </p>
      </div>
    </div>
  );
};

export default AnnounceMemberCard;
