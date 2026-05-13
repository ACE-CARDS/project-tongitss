export default function GradientLine({ start = false }: { start?: boolean }) {
  return (
    <div className={`w-40 h-1 bg-gradient-to-r from-[#eec643] to-[#0d21a1] ${start ? 'lg:ml-0 mx-auto lg:mx-0' : 'mx-auto'} rounded-full mt-3`} />
  );
}