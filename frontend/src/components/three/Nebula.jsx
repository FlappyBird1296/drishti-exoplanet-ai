export default function Nebula() {
    return (
        <div className="
            pointer-events-none
            absolute
            inset-0
            overflow-hidden
        ">

            {/* Main purple nebula */}
            <div className="
                absolute
                -right-[10%]
                top-[8%]
                h-[70%]
                w-[65%]
                rounded-full
                bg-[radial-gradient(ellipse_at_center,rgba(105,76,170,0.24)_0%,rgba(61,46,111,0.08)_35%,transparent_72%)]
                blur-3xl
            " />

            {/* Blue atmospheric cloud */}
            <div className="
                absolute
                right-[5%]
                top-[35%]
                h-[55%]
                w-[55%]
                rounded-full
                bg-[radial-gradient(ellipse_at_center,rgba(50,92,180,0.18)_0%,rgba(35,57,120,0.06)_40%,transparent_75%)]
                blur-3xl
            " />

            {/* Warm glow behind the star */}
            <div className="
                absolute
                right-[27%]
                top-[23%]
                h-[38%]
                w-[32%]
                rounded-full
                bg-[radial-gradient(ellipse_at_center,rgba(255,190,80,0.09)_0%,rgba(255,160,60,0.025)_42%,transparent_75%)]
                blur-3xl
            " />

            {/* Distant violet cloud */}
            <div className="
                absolute
                right-[45%]
                top-[12%]
                h-[35%]
                w-[30%]
                rounded-full
                bg-[radial-gradient(ellipse_at_center,rgba(115,85,190,0.07)_0%,transparent_70%)]
                blur-3xl
            " />

            <div className="
                absolute
                -right-[5%]
                top-[18%]
                h-[35%]
                w-[75%]
                rotate-[-12deg]
                rounded-full
                bg-[radial-gradient(ellipse_at_center,rgba(120,100,170,0.055)_0%,rgba(70,80,145,0.025)_35%,transparent_70%)]
                blur-2xl
            " />

        </div>
    );
}