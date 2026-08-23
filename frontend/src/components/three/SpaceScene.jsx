export default function SpaceScene() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute left-[35%] top-[25%] h-1 w-1 rounded-full bg-white shadow-[0_0_8px_#fff]" />
      <div className="absolute left-[70%] top-[35%] h-1 w-1 rounded-full bg-violet-300 shadow-[0_0_10px_#a78bfa]" />
      <div className="absolute left-[18%] top-[55%] h-1 w-1 rounded-full bg-sky-300 shadow-[0_0_10px_#60a5fa]" />
      <div className="absolute bottom-[8%] left-[8%] h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(124,92,255,.5),rgba(30,64,175,.12)_35%,transparent_70%)] blur-sm" />
      <div className="absolute bottom-[-30px] left-[-30px] h-[190px] w-[340px] rotate-[-8deg] rounded-[50%] bg-gradient-to-t from-violet-950/50 to-transparent blur-xl" />
    </div>
  );
}
