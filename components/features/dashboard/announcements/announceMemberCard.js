const AnnounceMemberCard = ({ announce_dash }) => {
  
  return (
    <div className="ml-4 mb-4 p-4 rounded-xl border-1 border-l-4 border-l-[#011638] border-[#d7d7d7] pr-6 pl-6 bg-white">
      <h3 className="text-l font-bold text-[#141414] pb-2 pt-2 break-words">
        {announce_dash.announce_dash_title}
      </h3>
      <div className="opacity-85">
        <p className="text-[#141414] text-justify text-sm break-words">
          {announce_dash.announce_dash_desc}
        </p>
      </div>
    </div>
  );
};

export default AnnounceMemberCard;
